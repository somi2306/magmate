import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller'; 

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
transport: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "maghrebmate@gmail.com",
    pass: "ycgoxaewcukwjmfc"
  },
  tls: {
    rejectUnauthorized: false // Add this for development
  },
  debug: true, // Enable debugging
  logger: true
},
        defaults: {
          from: '"Magmate" <noreply@magmate-6019a.firebaseapp.com>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates',
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}