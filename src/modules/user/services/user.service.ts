import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async create(createUserDto: CreateUserDto): Promise<Object> {
    if (!createUserDto.password) {
      throw new Error('비밀번호는 필수 입력값입니다.');
    }

    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return { message: '회원가입이 성공적으로 이루어졌습니다.' };
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    const updated = await this.userRepository.findOneBy({ id });

    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
