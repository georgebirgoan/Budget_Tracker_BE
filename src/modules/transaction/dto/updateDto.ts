import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTransactionDto{
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
    title:string;

    @IsString()
    type:string
}