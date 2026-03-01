import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationOrmEntity, NotificationSubscriptionOrmEntity } from './infrastructure/persistence/repositories/user-notification.orm-entity';
import { UserNotificationRepositoryImpl, NotificationSubscriptionRepositoryImpl } from './infrastructure/persistence/repositories/user-notification.repository';
import { UserNotificationService } from './application/services/user-notification.service';
import { UserNotificationController } from './presentation/controllers/user-notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotificationOrmEntity, NotificationSubscriptionOrmEntity]),
  ],
  controllers: [UserNotificationController],
  providers: [
    UserNotificationService,
    { provide: 'IUserNotificationRepository', useClass: UserNotificationRepositoryImpl },
    { provide: 'INotificationSubscriptionRepository', useClass: NotificationSubscriptionRepositoryImpl },
  ],
  exports: [UserNotificationService],
})
export class M12NotificationsModule {}
