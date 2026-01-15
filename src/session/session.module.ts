import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
    imports:[PrismaModule],
    exports:[],
    providers:[]
})


export class SessionModule{};