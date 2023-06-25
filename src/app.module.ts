import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { jwtModule } from './common/config/jwt.module.config';

@Module({
  imports: [
    PlacesModule,
    PrismaModule,
    ReviewsModule,
    UsersModule,
    AuthModule,
    jwtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
