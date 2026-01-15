import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from '../dto/register.dto.';
import { JwtAuthGuard } from 'src/modules/auth/common/guards/jwt-auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('auth')
@Controller('auth')
export class RegisterController {
  constructor(private readonly userService: RegisterService) {}

 

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    try{
      console.log("data from front:",createUserDto);
      return this.userService.create(createUserDto);

    }
    catch(err:any){
      console.log("register fails",err?.response?.data);
      throw err;
    }
  }

  @Get('getUser/:id')
  getUserByIdTest(@Param('id') id:string ){
    return this.userService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
