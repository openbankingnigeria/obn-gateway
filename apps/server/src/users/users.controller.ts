import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(IValidationPipe)
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Get()
  @UsePipes(IValidationPipe)
  listUsers() {
    return this.usersService.listUsers();
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
