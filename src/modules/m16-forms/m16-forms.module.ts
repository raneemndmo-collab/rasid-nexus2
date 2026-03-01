import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormDefinitionEntity, FormSubmissionEntity } from './infrastructure/persistence/repositories/form.orm-entity';
import { FormRepository } from './infrastructure/persistence/repositories/form.repository';
import { FormService } from './application/services/form.service';
import { FormController } from './presentation/controllers/form.controller';
import { FORM_REPOSITORY } from './domain/interfaces/form-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FormDefinitionEntity, FormSubmissionEntity])],
  controllers: [FormController],
  providers: [
    { provide: FORM_REPOSITORY, useClass: FormRepository },
    FormService,
  ],
  exports: [FormService],
})
export class M16FormsModule {}
