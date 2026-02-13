import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private readonly app: admin.app.App;

    constructor(private config: ConfigService) {
        const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
        const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
        const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');

        // Debug: Verificar que se están leyendo las variables
        console.log('🔍 Variables de Firebase:');
        console.log('  - Project ID:', projectId ? '✅ Cargado' : '❌ No encontrado');
        console.log('  - Private Key:', privateKey ? '✅ Cargado' : '❌ No encontrado');
        console.log('  - Client Email:', clientEmail ? '✅ Cargado' : '❌ No encontrado');

        // Validar variables de entorno
        if (!projectId || !privateKey || !clientEmail) {
            console.error('❌ Faltan variables de entorno de Firebase');
            throw new Error('Faltan variables de entorno de Firebase');
        }

        console.log('🔥 Inicializando Firebase Admin SDK...');

        // Inicializar Firebase Admin SDK
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                privateKey,
                clientEmail,
            }),
        });

        console.log('✅ Firebase Admin SDK inicializado correctamente');
    }

    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        try {
            console.log('🔍 Verificando token de Firebase...');
            const decodedToken = await this.app.auth().verifyIdToken(token);
            console.log('✅ Token válido para usuario:', decodedToken.uid);
            return decodedToken;
        } catch (error) {
            console.error('❌ Error verificando token:', error);
            throw new Error('Token inválido o expirado');
        }
    }
}

