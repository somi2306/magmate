import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRequestEntity } from './entities/userrequest.entity';
import {MessageEntity} from "../messagerie/models/message.entity"
import {ConversationEntity} from "../messagerie/models/conversation.entity"
import {ActiveConversation} from "../messagerie/models/active-conversation.entity"
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,UserRequestEntity,MessageEntity,ConversationEntity,  MailModule,])],
  controllers: [UserController],
  providers: [UserService,  MailService],
  exports: [UserService]
})
export class UserModule {}
