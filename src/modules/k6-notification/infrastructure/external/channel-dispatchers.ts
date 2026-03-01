import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationEntity } from '../../domain/entities/notification.entity';
import { IChannelDispatcher } from '../../domain/interfaces/notification-repository.interface';

@Injectable()
export class EmailDispatcher implements IChannelDispatcher {
  private readonly logger = new Logger(EmailDispatcher.name);
  channel = NotificationChannel.EMAIL;

  async dispatch(notification: NotificationEntity): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`[EMAIL] Sending to ${notification.recipientId}: ${notification.subject}`);
    // In production: integrate with SendGrid/SES/SMTP
    // For now: log-based dispatch (pluggable via DI)
    return { success: true };
  }
}

@Injectable()
export class SmsDispatcher implements IChannelDispatcher {
  private readonly logger = new Logger(SmsDispatcher.name);
  channel = NotificationChannel.SMS;

  async dispatch(notification: NotificationEntity): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`[SMS] Sending to ${notification.recipientId}: ${notification.body.substring(0, 50)}`);
    return { success: true };
  }
}

@Injectable()
export class PushDispatcher implements IChannelDispatcher {
  private readonly logger = new Logger(PushDispatcher.name);
  channel = NotificationChannel.PUSH;

  async dispatch(notification: NotificationEntity): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`[PUSH] Sending to ${notification.recipientId}: ${notification.subject}`);
    return { success: true };
  }
}

@Injectable()
export class InAppDispatcher implements IChannelDispatcher {
  private readonly logger = new Logger(InAppDispatcher.name);
  channel = NotificationChannel.IN_APP;

  async dispatch(notification: NotificationEntity): Promise<{ success: boolean; error?: string }> {
    this.logger.log(`[IN_APP] Storing for ${notification.recipientId}: ${notification.subject}`);
    return { success: true };
  }
}
