import { Injectable, OnModuleInit, OnModuleDestroy, Logger} from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { ConfigService } from '../config/config.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.databaseHost,
      port: this.configService.databasePort,
      user: this.configService.databaseUser,
      password: this.configService.databasePassword,
      database: this.configService.databaseName,
      ssl: {
        rejectUnauthorized: false, // Railway requiere SSL
      },
      max: 20, // Número máximo de clientes en el pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Verificar conexión
    try {
      const client = await this.pool.connect();
      this.logger.log('✅ Database connected successfully');
      client.release();
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('🔌 Database connection closed');
  }

  /**
   * Ejecuta una query SQL
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Query executed in ${duration}ms: ${text}`);
      return result;
    } catch (error) {
      this.logger.error(`Query error: ${text}`, error);
      throw error;
    }
  }

  /**
   * Obtiene un cliente del pool para transacciones
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Ejecuta una transacción
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helpers para queries comunes
   */
  async findOne<T = any>(
    table: string,
    conditions: Record<string, any>,
  ): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`,
      values,
    );

    return result.rows[0] || null;
  }

  async findAll<T = any>(
    table: string,
    conditions?: Record<string, any>,
  ): Promise<T[]> {
    if (!conditions || Object.keys(conditions).length === 0) {
      const result = await this.query<T>(`SELECT * FROM ${table}`);
      return result.rows;
    }

    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE ${whereClause}`,
      values,
    );

    return result.rows;
  }

  async insert<T = any>(
    table: string,
    data: Record<string, any>,
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.query<T>(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async update<T = any>(
    table: string,
    id: string | number,
    data: Record<string, any>,
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const result = await this.query<T>(
      `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id],
    );

    return result.rows[0];
  }

  async delete(
    table: string,
    id: string | number,
  ): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${table} WHERE id = $1`,
      [id],
    );

    return result.rowCount > 0;
  }
}