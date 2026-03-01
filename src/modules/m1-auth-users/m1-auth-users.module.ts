import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/repositories/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { USER_REPOSITORY } from './domain/interfaces/user-repository.interface';
import { USER_VALIDATOR } from '../k1-auth/application/services/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_VALIDATOR,
      useExisting: UserService,
    },
  ],
  exports: [UserService, USER_VALIDATOR],
})
export class M1AuthUsersModule {}
