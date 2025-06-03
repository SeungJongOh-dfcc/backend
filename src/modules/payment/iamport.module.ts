import { Module } from '@nestjs/common';
import { IamportController } from './controller/iamport.controller';
import { IamportService } from './service/iamport.service';

@Module({
  controllers: [IamportController],
  providers: [IamportService],
})
export class IamportModule {}
