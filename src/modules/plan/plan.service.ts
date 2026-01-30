import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddPriorityDto } from "./dto/planDto";


@Injectable()

export class PlanService{
    constructor(private prisma:PrismaService){}

async postPriorities(dto: AddPriorityDto) {
  const groupName = dto.category.trim();

  const group = await this.prisma.planGroup.upsert({
    where: {
      monthKey_name: {
        monthKey: dto.monthKey,
        name: groupName,
      },
    },
    create: {
      monthKey: dto.monthKey,
      name: groupName,
      order: 0,
    },
    update: {}, 
    select: { id: true, name: true, monthKey: true },
  });


  const last = await this.prisma.planItem.findFirst({
    where: { groupId: group.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const item = await this.prisma.planItem.create({
    data: {
      groupId: group.id,
      name: dto.name.trim(),
      amount: dto.amount,
      note: dto.note?.trim(),
      date: new Date(dto.date),
      order: (last?.order ?? 0) + 1,
    },
  });

  return { message: 'Created', group, data: item };
}


    async getProritatiGroup(monthKey:string){
      const groups = await this.prisma.planGroup.findMany({
        where: { monthKey },
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: [{ order: 'asc' }, { date: 'desc' }],
          },
        },
      });

      return { monthKey, groups };
    }
    
    async getRecentItems(monthKey: string) {
        return this.prisma.planItem.findMany({
          where: { group: { monthKey } },
          orderBy: { date: 'desc' },
          include: {
            group: { select: { name: true } },
          },
        });
      }


}


