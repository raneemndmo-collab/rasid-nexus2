import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { AuthRepository } from './infrastructure/persistence/repositories/auth.repository';
import { AuthTokenOrmEntity } from './infrastructure/persistence/repositories/auth-token.orm-entity';
import { AUTH_REPOSITORY } from './domain/interfaces/auth-repository.interface';
import { JwtAuthGuard } from '@shared/presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthTokenOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: `${config.get<number>('JWT_EXPIRATION', 3600)}s` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class K1AuthModule {}
