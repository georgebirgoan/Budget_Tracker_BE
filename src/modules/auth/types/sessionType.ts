import { Role } from '@prisma/client';


export type SessionUserType={
    id:number,
    refreshToken:string | null,
    user:{
        id:number,
        email:string,
        fullName:string | null,
        role:Role
    }
}


