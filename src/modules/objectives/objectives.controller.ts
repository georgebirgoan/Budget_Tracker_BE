import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Get()
  getObjectives(@Req() req) {
    return this.objectivesService.getObjectives(req.user.id);
  }

  @Post()
  createObjective(@Req() req, @Body() dto: CreateObjectiveDto) {
    return this.objectivesService.createObjective(req.user.id, dto);
  }

  @Patch(':id')
  updateObjective(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateObjectiveDto,
  ) {
    return this.objectivesService.updateObjective(req.user.id, id, dto);
  }

  @Delete(':id')
  deleteObjective(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.objectivesService.deleteObjective(req.user.id, id);
  }
}
