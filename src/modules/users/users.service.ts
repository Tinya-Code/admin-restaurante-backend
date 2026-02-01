import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.databaseService.findOne<User>(
        'users',
        { email: createUserDto.email },
      );

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Insertar usuario (sin contraseña)
      const user = await this.databaseService.insert<User>('users', {
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role || 'user',
        status: createUserDto.status || 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.logger.log(`User created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.databaseService.findAll<User>('users');
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.databaseService.findOne<User>('users', { id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.databaseService.findOne<User>('users', { email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    await this.findOne(id);

    const updateData: any = {
      ...updateUserDto,
      updated_at: new Date(),
    };

    // Si se actualiza el email, verificar que no exista
    if (updateUserDto.email) {
      const existingUser = await this.databaseService.query<User>(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [updateUserDto.email, id],
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.databaseService.update<User>('users', id, updateData);

    this.logger.log(`User updated: ${id}`);
    return user;
  }

  async remove(id: string): Promise<void> {
    // Verificar que el usuario existe
    await this.findOne(id);

    const deleted = await this.databaseService.delete('users', id);

    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User deleted: ${id}`);
  }
}
