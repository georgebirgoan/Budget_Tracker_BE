import { AddPriorityDto } from './dto/planDto';
import { Body, Controller, Delete, Get,Param,ParseIntPipe,Patch,Post } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { AddGroupDto } from './dto/group.Dto';
import { AddPriorityInGroupDto } from './dto/priorityInGroupDto';
import { UpdateGroupDto } from './dto/updateGroupDto';
import { ReorderGroupsDto } from './dto/reorderDto';

@Controller('plan')
export class PlanController {
  constructor(private planService:PlanService) {}


  @Post('addPriorities')
  async postPriorities (
    @Body() val:AddPriorityDto
  ){
    return this.planService.postPriorities(val)
  }

    @Post('groups/create')
  async addNewGroup (
    @Body() val:AddGroupDto
  ){
    return this.planService.addNewGroup(val)
  }

  @Patch("reorderGroups")
    reorderGroups(@Body() dto: ReorderGroupsDto) {
      return this.planService.reorderGroups(dto);
    }


@Post('addPriorityInGroup')
  async addNewPriorityInGroup (
          @Body() dto:AddPriorityInGroupDto
        ){
          console.log("ajunge in backend")
            return this.planService.addNewPriority(dto);
        }

@Delete("deleteGroup/:id")
  deleteGroup(@Param("id", ParseIntPipe) id: number) {
    return this.planService.deleteGroup(id);
  }

  @Patch("updateGroup")
  updateGroup(@Body() dto: UpdateGroupDto) {
    return this.planService.updateGroup(dto);
  }

  @Get('getGroupParam/:monthKey')
    getPlan(@Param('monthKey') monthKey: string) {
      return this.planService.getProritatiGroup(monthKey);
    }

    //get
    @Get('priorities/getItems')
    getRecent(
      @Param('monthKey') monthKey: string,
    ) {
      return this.planService.getRecentItems(
        monthKey,
      );
    }

  

}