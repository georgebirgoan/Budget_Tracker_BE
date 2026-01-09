import { IsNumber, IsOptional, IsString } from "class-validator";

export class TransactionDto{
    @IsNumber()
    amount:number;
    
    @IsOptional()
    @IsString()
    categoryId?:string;

    @IsString()
    date:string;

    @IsString()
    description:string;

    @IsString()
    repeat:string;

    @IsString()
    title:string;

    @IsString()
    type:string
}