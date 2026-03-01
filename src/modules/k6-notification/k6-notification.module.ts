import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity, NotificationTemplateOrmEntity, NotificationPreferenceOrmEntity } from './infrastructure/persistence/repositories/notification.orm-entity';
import { NotificationRepositoryImpl, NotificationTemplateRepositoryImpl, NotificationPreferenceRepositoryImpl } from './infrastructure/persistence/repositories/notification.repository';
import { NotificationService } from './application/services/notification.service';
import { TemplateEngineService } from './application/services/template-engine.service';
import { NotificationController } from './presentation/controllers/notification.controller';
import { EmailDispatcher, SmsDispatcher, PushDispatcher, InAppDispatcher } from './infrastructure/external/channel-dispatchers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationOrmEntity,
      NotificationTemplateOrmEntity,
      NotificationPreferenceOrmEntity,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    TemplateEngineService,
    EmailDispatcher,
    SmsDispatcher,
    PushDispatcher,
    InAppDispatcher,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: 'INotificationTemplateRepository',
      useClass: NotificationTemplateRepositoryImpl,
    },
    {
      provide: 'INotificationPreferenceRepository',
      useClass: NotificationPreferenceRepositoryImpl,
    },
    {
      provide: 'CHANNEL_DISPATCHERS',
      useFactory: (email: EmailDispatcher, sms: SmsDispatcher, push: PushDispatcher, inApp: InAppDispatcher) => [email, sms, push, inApp],
      inject: [EmailDispatcher, SmsDispatcher, PushDispatcher, InAppDispatcher],
    },
  ],
  exports: [NotificationService, TemplateEngineService],
})
export class K6NotificationModule {}
