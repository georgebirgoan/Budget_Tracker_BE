import { Body, Controller ,Get, Param, ParseIntPipe, Patch} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/get-user.dto';

@Controller('users')
export class UsersController {
    constructor (private readonly userService:UsersService){}



    @Get("/all")
    getAll(){
        return this.userService.getAll();
    }

    @Patch('/:id/role')
    updateRole(
        @Param('id',ParseIntPipe) id: number,
        @Body() dto:UpdateRoleDto
    ){
        return this.userService.updateRole(id,dto);
    }





}
