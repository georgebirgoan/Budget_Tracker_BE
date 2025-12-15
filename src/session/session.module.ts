import { Module } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { SessionService } from "./session.service";
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
    imports:[RedisModule,PrismaModule],
    exports:[SessionService],
    providers:[SessionService]
})


export class SessionModule{};