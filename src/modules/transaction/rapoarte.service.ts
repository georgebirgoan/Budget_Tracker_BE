import { Injectable,Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { TransactionDto } from "./dto/transaction.dto";
import { da } from "zod/v4/locales";

@Injectable()
export class RapoarteService{
  constructor(private readonly prisma: PrismaService) {}
    

  async postTransaction(data:TransactionDto){
    const transaction =  await this.prisma.transaction.create({
            data:{
                amount:data.amount,
                categoryId:data.categoryId,
                date:data.date,
                description:data.description,
                repeat:data.repeat,
                title:data.title,
                type:data.type,
            },
         })

         return{
            message:"Transactiea creata cu succes!",
            transaction
         }
  }


async getTransactions(){
    const getAllTransactions = await this.prisma.transaction.findMany();

    return {
        message:"S-a returnt datele cu succes!",
        getAllTransactions
    }
}

async deleteTransaction(id: number) {
    const exists = await this.prisma.transaction.findUnique({
      where: { transactionId: id },
    });

    if (!exists) {
      throw new NotFoundException("Transaction not found");
    }

    const deleted = await this.prisma.transaction.delete({
      where: { transactionId: id },
    });

    return {
      message: "Transaction deleted successfully",
      data: deleted,
    };
  }

async updateTransaction(id: number, dto: TransactionDto) {
  const updated = await this.prisma.transaction.update({
    where: { transactionId: id },
    data: dto,
  });

  return { message: "Tranzacția a fost actualizată", data: updated };
}

}