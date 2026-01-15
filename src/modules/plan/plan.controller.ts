import { Body, Controller, Get,Post } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { validatePlanDto } from "./dto/planDto";


@Controller('plan')
export class PlanController {
  constructor(private planService:PlanService) {}


  @Post('addPriorities')
  async postPriorities (
    @Body() val:validatePlanDto
  ){
    return this.planService.postPriorities(val)
  }

  @Get("getPriorities")
  async getPriorities(){
    return this.planService.getProritati();
  }

  

}