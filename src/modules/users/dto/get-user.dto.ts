import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetUserDto {
    @ApiProperty({example:1})
    id:number
    
    @ApiProperty({ example: "george@example.com" })
    email: string;

    @ApiProperty({ example: "George Birgoan", nullable: true })
    fullName?: string | null;

    @ApiProperty({ example: "2025-11-15T10:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2025-11-15T10:05:00.000Z" })
    updatedAt: Date;

}


export class UpdateRoleDto {
    @IsEnum(Role)
    @IsNotEmpty()
    role:Role

}