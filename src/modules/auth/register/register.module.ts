import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth.module';
@Module({
  imports:[PrismaModule,AuthModule],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}
