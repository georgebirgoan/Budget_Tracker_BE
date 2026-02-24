import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddPriorityDto } from "./dto/planDto";
import { AddGroupDto } from "./dto/group.Dto";
import { AddPriorityInGroupDto } from "./dto/priorityInGroupDto";
import { Prisma } from "@prisma/client";
import { UpdateGroupDto } from "./dto/updateGroupDto";
import { ReorderGroupsDto } from "./dto/reorderDto";


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


 async addNewGroup(dto: AddGroupDto) {
    const monthKey = dto.monthKey?.trim();
    const name = dto.name?.trim();

    if (!monthKey || !name) {
      throw new BadRequestException("monthKey and name are required");
    }

    const last = await this.prisma.planGroup.findFirst({
      where: { monthKey },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (last?.order ?? 0) + 1;

    return this.prisma.planGroup.create({
      data: {
        monthKey,
        name,
        order: nextOrder,
      },
    });
  }
 async addNewPriority(dto: AddPriorityInGroupDto) {
    const groupId = dto.groupId;
    const name = dto.title.trim();

    let dateValue = new Date();
    if (dto.date && dto.date.trim() !== "") {
      const d = new Date(dto.date);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException("date must be valid (YYYY-MM-DD)");
      }
      dateValue = d;
    }

    const amountDecimal = new Prisma.Decimal(dto.amount);

    // 1) group exists
    const group = await this.prisma.planGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });
    if (!group) throw new NotFoundException("Group not found");

    // 2) next order in that group
    const last = await this.prisma.planItem.findFirst({
      where: { groupId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (last?.order ?? 0) + 1;

    // 3) create item
    return this.prisma.planItem.create({
      data: {
        groupId,
        name,
        amount: amountDecimal,
        note: dto.note?.trim() || null,
        date: dateValue,
        order: nextOrder,
      },
    });
  }
  
async updateGroup(dto: UpdateGroupDto) {
    const groupId = dto.groupId;
    const name = dto.name.trim();

    if (!name) throw new BadRequestException("name is required");

    const exists = await this.prisma.planGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException("Group not found");

    return this.prisma.planGroup.update({
      where: { id: groupId },
      data: { name }, 
    });
  }
async deleteGroup(id: number) {
  return this.prisma.planGroup.delete({ where: { id } });
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

      const data =await  this.prisma.planItem.findMany({
          where: { group: { monthKey } },
          orderBy: { date: 'desc' },
          include: {
            group: { select: { name: true } },
          },
        });


        return{
          message:"Date returnate cu succes!",
          data:data
        }
      }

  async reorderGroups(dto: ReorderGroupsDto) {
  const updates = dto.groupIds.map((id, index) =>
    this.prisma.planGroup.update({
      where: { id },
      data: { order: index + 1 },
    })
  );

  await this.prisma.$transaction(updates);
  return { ok: true };
}

  
    

}


