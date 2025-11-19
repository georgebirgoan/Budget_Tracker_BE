import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRoleDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
    constructor (private prisma:PrismaService){}

    getAll(){
        return this.prisma.user.findMany();
    }

   async updateRole(id:number,dto:UpdateRoleDto){
        const user  = await this.prisma.user.findUnique({
            where:{
                id
            }
        })
        if(!user ) {
            throw new Error("User not found!");
        }
        const updated  = await this.prisma.user.update({
            where:{id},
            data:{role:dto.role}
        })

        return updated;
    }

}
