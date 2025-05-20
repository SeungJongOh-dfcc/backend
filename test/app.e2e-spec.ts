// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/modules/user/entities/user.entity'; // 실제 경로에 맞게 조정
import { UserModule } from '../src/modules/user/user.module';
import { AuthModule } from '../src/modules/auth/auth.module'; // 실제 경로에 맞게 조정
import * as request from 'supertest';

describe('App E2E Test (SQLite in-memory)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        UserModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/user (GET) should return empty array initially', () => {
    return request(app.getHttpServer()).get('/user').expect(200).expect([]);
  });

  afterAll(async () => {
    await app.close();
  });
});
