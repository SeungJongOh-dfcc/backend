import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoginDto } from '../auth/dto/login.dto';
import { UserDto } from '../auth/dto/user.dto';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() req: { user: UserDto }) {
    return {
      message: '인증된 사용자 정보입니다.',
      userId: req.user.userId,
      username: req.user.username,
    };
  }
}
