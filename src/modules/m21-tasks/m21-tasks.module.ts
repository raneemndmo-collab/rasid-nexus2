import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity, TaskCommentEntity } from './infrastructure/persistence/repositories/task.orm-entity';
import { TaskRepository } from './infrastructure/persistence/repositories/task.repository';
import { TaskService } from './application/services/task.service';
import { TaskController } from './presentation/controllers/task.controller';
import { TASK_REPOSITORY } from './domain/interfaces/task-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskCommentEntity])],
  controllers: [TaskController],
  providers: [
    { provide: TASK_REPOSITORY, useClass: TaskRepository },
    TaskService,
  ],
  exports: [TaskService],
})
export class M21TasksModule {}
