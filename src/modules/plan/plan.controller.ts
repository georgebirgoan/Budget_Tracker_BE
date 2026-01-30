import { AddPriorityDto } from './dto/planDto';
import { Body, Controller, Get,Param,Post } from "@nestjs/common";
import { PlanService } from "./plan.service";

@Controller('plan')
export class PlanController {
  constructor(private planService:PlanService) {}


  @Post('addPriorities')
  async postPriorities (
    @Body() val:AddPriorityDto
  ){
    return this.planService.postPriorities(val)
  }

  @Get('getGroupParam/:monthKey')
    getPlan(@Param('monthKey') monthKey: string) {
      return this.planService.getProritatiGroup(monthKey);
    }

    @Get('priorities/:monthKey/recent')
    getRecent(
      @Param('monthKey') monthKey: string,
    ) {
      return this.planService.getRecentItems(
        monthKey,
      );
    }

  

}