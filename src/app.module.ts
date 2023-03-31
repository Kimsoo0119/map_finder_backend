import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [PlacesModule, PrismaModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
