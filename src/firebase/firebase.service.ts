import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.config
            .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
        }),
      });
      this.logger.log('✅ Firebase Admin SDK initialized');
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    // checkRevoked: true fuerza validación contra Firebase cada vez
    return admin.auth().verifyIdToken(token, true);
  }
}