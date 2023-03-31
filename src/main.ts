import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma: PrismaService = app.get(PrismaService);
  prisma.enableShutdownHook(app);
  await app.listen(3005);
}
bootstrap();
