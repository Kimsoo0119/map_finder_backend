import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PlacesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
