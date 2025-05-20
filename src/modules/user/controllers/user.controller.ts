import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('id/:id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(+id);
  }

  @Get('check-email')
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ isDuplicate: boolean }> {
    const existing = await this.userService.findByEmail(email);
    return { isDuplicate: !!existing };
  }

  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
  ): Promise<{ isDuplicate: boolean }> {
    const existing = await this.userService.findByUsername(username);
    return { isDuplicate: !!existing };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<Object> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }
}
