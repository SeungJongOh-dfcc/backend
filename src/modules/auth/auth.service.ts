import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
}
