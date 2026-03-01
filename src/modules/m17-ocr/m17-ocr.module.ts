import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcrJobEntity } from './infrastructure/persistence/repositories/ocr.orm-entity';
import { OcrRepository } from './infrastructure/persistence/repositories/ocr.repository';
import { OcrService, VISION_ANALYSIS_PORT } from './application/services/ocr.service';
import { OcrController } from './presentation/controllers/ocr.controller';
import { OCR_REPOSITORY } from './domain/interfaces/ocr-repository.interface';

// Default stub for IVisionAnalysisPort — replaced by M11 in production
const VisionAnalysisStub = {
  provide: VISION_ANALYSIS_PORT,
  useValue: {
    analyzeImage: async (_t: string, _u: string, _p: string) => ({ text: 'stub', requestId: 'stub-id' }),
  },
};

@Module({
  imports: [TypeOrmModule.forFeature([OcrJobEntity])],
  controllers: [OcrController],
  providers: [
    { provide: OCR_REPOSITORY, useClass: OcrRepository },
    VisionAnalysisStub,
    OcrService,
  ],
  exports: [OcrService],
})
export class M17OcrModule {}
