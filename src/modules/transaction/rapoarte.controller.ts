import { Body, Controller, Delete, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { Get } from "@nestjs/common";
import { RapoarteService } from "./rapoarte.service";
import { Param } from "@nestjs/common";
import { TransactionDto } from "./dto/transaction.dto";



@Controller('transactions')
export class RapoarteController{
  constructor(
    private readonly rapoarteService:RapoarteService


  ){}

 @Post('insert')
 async insertTransaction(@Body() data:TransactionDto){
  return  this.rapoarteService.postTransaction(data)
 }


 @Get('getTransactions')
 async getTransactions(){
   return this.rapoarteService.getTransactions();
 }

 @Delete(":id")
 async deleteTransaction(
  @Param("id",ParseIntPipe) id:number
 ){
    return this.rapoarteService.deleteTransaction(id);
 }

 @Patch(":id")
updateTransaction(@Param("id", ParseIntPipe) id: number, @Body() dto: TransactionDto) {
  return this.rapoarteService.updateTransaction(id, dto);
}

}