import { Module } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { SessionService } from "./session.service";


@Module({
    imports:[RedisModule],
    exports:[SessionService],
    providers:[SessionService]
})


export class SessionModule{};