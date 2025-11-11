import { PrismaService } from 'src/prisma/prisma.service';
import {Global, Module } from '@nestjs/common';

@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
