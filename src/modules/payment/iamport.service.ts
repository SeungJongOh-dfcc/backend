import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class IamportService {
  private readonly apiUrl = 'https://api.iamport.kr';

  async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/users/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imp_key: process.env.PORTONE_API_KEY,
        imp_secret: process.env.PORTONE_API_SECRET,
      }),
    });

    console.log('여기까지 오나?');

    if (!response.ok) {
      throw new HttpException('아임포트 토큰 요청 실패', response.status);
    }

    const data = await response.json();

    if (!data.response?.access_token) {
      throw new HttpException('아임포트 토큰 발급 실패', 500);
    }

    return data.response.access_token;
  }

  async verifyPayment(imp_uid: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.apiUrl}/payments/${imp_uid}`, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new HttpException('결제 검증 요청 실패', response.status);
    }

    const data = await response.json();
    return data.response;
  }
}
