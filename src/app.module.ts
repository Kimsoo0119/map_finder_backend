import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [PlacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
