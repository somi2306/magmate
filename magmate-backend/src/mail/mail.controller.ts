import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

class SendEmailDto {
  to: string;
  subject: string;
  body: string;
}

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-contact-email')
  @ApiOperation({ summary: 'Envoyer un email de contact' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ status: 200, description: 'Email envoyé avec succès.' })
  @ApiResponse({ status: 500, description: 'Erreur lors de l\'envoi de l\'email.' })
  async sendContactEmail(@Body() sendEmailDto: SendEmailDto) {
    const { to, subject, body } = sendEmailDto;
    try {
      await this.mailService.sendContactEmail(to, subject, body, `<p>${body}</p>`);
      return { message: 'Email envoyé avec succès.' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new InternalServerErrorException('Erreur lors de l\'envoi de l\'email.');
    }
  }
}