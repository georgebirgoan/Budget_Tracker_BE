import { IsInt, IsNumber, IsString } from "class-validator";


export class validatePlanDto{
    @IsString({message:"Campul trebuie sa fie de tip string!"})
    name:string;

    @IsNumber({},{message:"Campul trebuie sa fie o suma valida!"})
    amount :number;
    
    @IsString({message:"Campul category sa fie o valoare de tip string!"})
    category :string;
    

    @IsString({message:"Campul note sa fie o valoare de tip string!"})
    note :string;
    
    @IsString({message:"Campul date sa fie o valoare de tip string!"})
    date :string;

}