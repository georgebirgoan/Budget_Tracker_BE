import { Module } from '@nestjs/common';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth/jwt-auth.guard';

@Module({
  controllers: [ObjectivesController],
  providers: [ObjectivesService, JwtAuthGuard],
})
export class ObjectivesModule {}
