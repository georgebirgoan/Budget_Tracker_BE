import { Body, Controller, ParseIntPipe } from "@nestjs/common";
import { Get } from "@nestjs/common";
import { RapoarteService } from "./rapoarte.service";
import { Param } from "@nestjs/common";



@Controller('comenzi')
export class RapoarteController{
  constructor(
    private readonly rapoarteService:RapoarteService


  ){}

  // comenzi finalizate pentru un interval
 @Get('finalizate')
 async getFinalizate(){
    return this.rapoarteService.getComneziFinalizate();
 }

 //comenzi lucru pentru interval
  @Get('lucru')
 async getOferte(){
    return this.rapoarteService.getComenziLucru();
 }

 //productie pt o perioada 
   @Get('productie')
 async getProductie(){
    return this.rapoarteService.getProductie();
 }
 //produs
   @Get('produs')
 async getProdus(){
    return this.rapoarteService.getProdus();
 }

  //detalii comenzi
   @Get('finalizate/:codunicoferta/detalii')
 async getDetaliiFinalizate(
    @Param('codunicoferta',ParseIntPipe) codunicoferta: number
 ){
    return this.rapoarteService.getDetaliiFinalizate(codunicoferta);
 }




}