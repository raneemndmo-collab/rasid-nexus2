import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity, ProjectMemberEntity } from './infrastructure/persistence/repositories/project.orm-entity';
import { ProjectRepository } from './infrastructure/persistence/repositories/project.repository';
import { ProjectService } from './application/services/project.service';
import { ProjectController } from './presentation/controllers/project.controller';
import { PROJECT_REPOSITORY } from './domain/interfaces/project-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ProjectMemberEntity])],
  controllers: [ProjectController],
  providers: [
    { provide: PROJECT_REPOSITORY, useClass: ProjectRepository },
    ProjectService,
  ],
  exports: [ProjectService],
})
export class M22ProjectsModule {}
