import { Body, Controller, Post } from '@nestjs/common';
import { IamportService } from './iamport.service';

@Controller('payment')
export class IamportController {
  constructor(private readonly iamportService: IamportService) {}

  @Post('verify')
  async verify(@Body() body: { imp_uid: string }) {
    const paymentData = await this.iamportService.verifyPayment(body.imp_uid);

    // 예시 검증 로직: 금액 등
    if (paymentData.status === 'paid' && paymentData.amount === 5959) {
      return { success: true, data: paymentData };
    } else {
      return { success: false, message: '결제 정보 불일치' };
    }
  }
}
