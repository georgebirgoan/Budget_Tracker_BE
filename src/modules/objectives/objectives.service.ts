import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  async getObjectives(userId: number) {
    const objectives = await this.prisma.objective.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { message: 'Objectives retrieved successfully', objectives };
  }

  async createObjective(userId: number, dto: CreateObjectiveDto) {
    const objective = await this.prisma.objective.create({
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount,
        savedAmount: dto.savedAmount ?? 0,
        deadline: dto.deadline,
        description: dto.description,
        userId,
      },
    });

    return { message: 'Objective created successfully', objective };
  }

  async updateObjective(userId: number, id: number, dto: UpdateObjectiveDto) {
    const existing = await this.prisma.objective.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Objective not found');
    }

    const objective = await this.prisma.objective.update({
      where: { id },
      data: dto,
    });

    return { message: 'Objective updated successfully', objective };
  }

  async deleteObjective(userId: number, id: number) {
    const existing = await this.prisma.objective.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Objective not found');
    }

    await this.prisma.objective.delete({ where: { id } });

    return { message: 'Objective deleted successfully' };
  }
}
