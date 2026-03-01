import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinitionEntity, WorkflowExecutionEntity, WorkflowStepLogEntity } from './infrastructure/persistence/repositories/workflow.orm-entity';
import { WorkflowRepository } from './infrastructure/persistence/repositories/workflow.repository';
import { WorkflowService } from './application/services/workflow.service';
import { WorkflowController } from './presentation/controllers/workflow.controller';
import { WORKFLOW_REPOSITORY } from './domain/interfaces/workflow-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowDefinitionEntity, WorkflowExecutionEntity, WorkflowStepLogEntity])],
  controllers: [WorkflowController],
  providers: [
    { provide: WORKFLOW_REPOSITORY, useClass: WorkflowRepository },
    WorkflowService,
  ],
  exports: [WorkflowService],
})
export class M15WorkflowsModule {}
