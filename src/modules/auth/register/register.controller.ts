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
import { Role } from 'src/modules/auth/common/enums/role.enum';
import { Roles } from 'src/modules/auth/common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('auth')
@Controller('auth')
export class RegisterController {
  constructor(private readonly userService: RegisterService) {}

 

  @Post('register')
  @ApiOperation({summary:"User register"})
  @ApiResponse({status:200,description:"User succes register"})
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }
  // @SetMetadata('role', [Role.ADMIN])
  @Roles(Role.EDITOR)
  // @UseGuards(RolesGuard)
  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
