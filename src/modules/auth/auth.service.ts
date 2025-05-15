import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser({
    username,
    password,
  }: LoginDto): Promise<UserDto | null> {
    // 실제 서비스에서는 DB 조회 및 bcrypt로 비교
    if (username === 'admin' && password === '1234') {
      return { userId: 1, username };
    }
    return null;
  }

  async login(user: UserDto) {
    const { userId, username } = user;
    const payload = { username, sub: userId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
