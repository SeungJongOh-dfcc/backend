import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5174',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
