import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('POST /auth/login - should return accessToken cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin1234', password: 'admin1234' });

    expect([200, 201]).toContain(res.status);

    expect(res.body.message).toBe('로그인 성공');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
