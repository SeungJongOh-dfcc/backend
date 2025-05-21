import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { EmailVerification } from './entities/email-verification.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private mailerService: MailerService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
  ) {}

  async validateUser({
    username,
    password,
  }: LoginDto): Promise<UserDto | null> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    return plainToInstance(UserDto, user); // 비밀번호 제외된 DTO 반환
  }

  async login(user: UserDto) {
    const { id, username } = user;
    const payload = { username, sub: id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    userId: number,
    { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('현재 비밀번호가 틀렸습니다.');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await this.userRepository.save(user);
  }

  async sendVerificationEmail(email: string) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30분 후 만료

    // 기존 토큰 삭제 (중복 방지)
    await this.verificationRepository.delete({ email });

    // 새 토큰 저장
    const verification = this.verificationRepository.create({
      email,
      token,
      expiresAt,
      isVerified: false,
    });

    await this.verificationRepository.save(verification);

    const url = `http://localhost:3000/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 요청',
      template: 'verify',
      context: {
        verificationUrl: url,
        username: email,
      },
    });
  }

  async create(email: string, token: string): Promise<EmailVerification> {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1시간 후
    const entity = this.verificationRepository.create({
      email,
      token,
      expiresAt,
    });
    return this.verificationRepository.save(entity);
  }

  async verifyToken(token: string): Promise<EmailVerification | null> {
    return this.verificationRepository.findOneBy({ token });
  }

  async verifyEmailToken(
    token: string,
  ): Promise<{ message: string; email?: string }> {
    const verification = await this.verificationRepository.findOneBy({ token });

    if (!verification) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }

    if (verification.isVerified) {
      throw new BadRequestException('이미 인증된 이메일입니다.');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('토큰이 만료되었습니다.');
    }

    const user = await this.userRepository.findOneBy({
      email: verification.email,
    });

    verification.isVerified = true;
    await this.verificationRepository.save(verification);

    if (!user) {
      return {
        message: '이메일 인증이 완료되었습니다. 이제 회원가입을 진행해주세요.',
        email: verification.email,
      };
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    return { message: '이메일 인증이 완료되었습니다.' };
  }
}
