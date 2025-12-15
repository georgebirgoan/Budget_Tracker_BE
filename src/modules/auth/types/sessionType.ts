import { Role } from '@prisma/client';
import { email } from 'zod';


export type SessionUserType={
    id:number,
    refreshToken:string,
    user:{
        id:number,
        email:string,
        fullName:string | null,
        role:Role
    }
}


