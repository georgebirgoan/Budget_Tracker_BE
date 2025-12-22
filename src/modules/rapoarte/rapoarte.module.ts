import { Module } from "@nestjs/common";
import { RapoarteController } from "./rapoarte.controller";
import { RapoarteService } from "./rapoarte.service";



@Module({
    imports:[],
    controllers:[RapoarteController],
    providers:[RapoarteService]
})


export class RapoarteModule{}