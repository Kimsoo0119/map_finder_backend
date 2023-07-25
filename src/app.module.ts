import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtCustomModule } from './common/config/jwt.module.config';
import { CacheCustomModule } from './common/config/cache.module.config';
import { CustomConfigModule } from './common/config/config-module.config';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    CustomConfigModule,
    CacheCustomModule,
    JwtCustomModule,
    PlacesModule,
    PrismaModule,
    ReviewsModule,
    UsersModule,
    AuthModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
