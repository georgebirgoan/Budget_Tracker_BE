import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddPriorityDto } from "./dto/planDto";
import { AddGroupDto } from "./dto/group.Dto";
import { AddPriorityInGroupDto } from "./dto/priorityInGroupDto";
import { Prisma } from "@prisma/client";
import { UpdateGroupDto } from "./dto/updateGroupDto";
import { ReorderGroupsDto } from "./dto/reorderDto";
import { UpdateItemDto } from "./dto/itemUpdateDelete";



function parseDateOnlyLocalStart(dateOnly: string) {
  // dateOnly: "2026-02-01"
  const [y, m, d] = dateOnly.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0); // local time
  return dt;
}
function monthKeysBetween(startISO: string, endISO: string) {
  const [sy, sm] = startISO.slice(0, 7).split("-").map(Number);
  const [ey, em] = endISO.slice(0, 7).split("-").map(Number);

  const out: string[] = [];
  let y = sy;
  let m = sm;

  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m === 13) {
      m = 1;
      y++;
    }
  }
  return out;
}

function parseDateOnlyLocalEnd(dateOnly: string) {
  const [y, m, d] = dateOnly.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 23, 59, 59, 999); // local time
  return dt;
}


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

  async getPrioritatiGroupByRange(
    startDate: string,
    endDate: string,
    hideEmpty = false,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException("startDate and endDate are required");
    }

    const start = parseDateOnlyLocalStart(startDate);
    const end = parseDateOnlyLocalEnd(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException("Invalid date format. Use YYYY-MM-DD");
    }

    const monthKeys = monthKeysBetween(startDate, endDate);

    const groups = await this.prisma.planGroup.findMany({
      where: {
        monthKey: { in: monthKeys },

        ...(hideEmpty
          ? { items: { some: { date: { gte: start, lte: end } } } }
          : {}),
      },
      orderBy: [{ monthKey: "asc" }, { order: "asc" }],
      include: {
        items: {
          where: { date: { gte: start, lte: end } },
          orderBy: [{ order: "asc" }, { date: "desc" }],
        },
      },
    });

    return { monthKey: "range", groups };
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

  async updateItem(id: number, dto: UpdateItemDto) {
    const existing = await this.prisma.planItem.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    const updated = await this.prisma.planItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(dto.date !== undefined ? { date: dto.date } : {}),
      },
      include: { group: true },
    });

    return {
      message: 'Item updated successfully',
      data: updated,
    };
  }

  async deleteItem(id: number) {
    const existing = await this.prisma.planItem.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.planItem.delete({
      where: { id },
    });

    return {
      message: 'Item deleted successfully',
    };
  }
    

}


