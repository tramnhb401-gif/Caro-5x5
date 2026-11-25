import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [
      'http://localhost:8081',
      'http://localhost:8082',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:8082',
    ];
  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
