import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Admin Restaurante API')
    .setDescription('API para la gestión de restaurantes, menús, categorías y productos.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Configurar ValidationPipe con validación estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
      transform: true, // Transforma los payloads a los tipos de los DTOs
      transformOptions: {
        enableImplicitConversion: false, // No convertir tipos automáticamente
      },
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: '*', // Permitir cualquier origen en desarrollo para diagnosticar
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-restaurant-id'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Agregar middleware para COOP (requerido para popups de Firebase)
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none'); // Desactivar temporalmente para ver si es el bloqueante
    res.setHeader('Access-Control-Allow-Origin', '*'); // Forzar CORS extra
    next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Nest application successfully started on: http://localhost:${port}`);
  console.log(`📜 Swagger documentation: http://localhost:${port}/api\n`);
}
bootstrap();
