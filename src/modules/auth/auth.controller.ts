import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const { accessToken } = await this.authService.login(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // production true
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1시간
    });

    return { message: '로그인 성공', user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return {
      userId: req.user.userId,
      username: req.user.username,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // 개발 환경에서는 false, 배포 시 true
      sameSite: 'lax',
    });
    return { message: '로그아웃 완료' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.userId, dto);
    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const result = await this.authService.verifyEmailToken(token);
    if (result.email) {
      // 성공 시 signup 페이지로 리다이렉트하며 이메일 파라미터와 인증 완료 표시
      const redirectUrl = `http://localhost:5174/signup?email=${encodeURIComponent(result.email)}&verified=true`;
      return res.redirect(redirectUrl);
    }
    return result;
  }

  @Post('send-verification')
  async sendVerification(@Body('email') email: string) {
    await this.authService.sendVerificationEmail(email);
    return { message: '인증 메일이 발송되었습니다.' };
  }
}
