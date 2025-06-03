import { Module } from '@nestjs/common';
import { IamportController } from './iamport.controller';
import { IamportService } from './iamport.service';

@Module({
  controllers: [IamportController],
  providers: [IamportService],
})
export class IamportModule {}
