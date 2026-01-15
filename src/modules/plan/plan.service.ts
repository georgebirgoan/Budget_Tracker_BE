import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { validatePlanDto } from "./dto/planDto";


@Injectable()

export class PlanService{
    constructor(private prismaService:PrismaService){}


    async postPriorities(value:validatePlanDto){
        const postData = await this.prismaService.priorities.create({
            data:{
                ...value
            }
        })

        return {
            message:"Prioritate adaugata cu succes!",
            postData,
        }
    }


    async getProritati(){
        const data = await this.prismaService.priorities.findMany({
            orderBy:{
                date:"desc"
            }
        })

        return {
            message:"Sau returnat prioritatiel cu succes!",
            data
        }
    }

}


