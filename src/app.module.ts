import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { IamportModule } from './modules/payment/iamport.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    IamportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
