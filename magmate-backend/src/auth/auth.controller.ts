// src/auth/auth.controller.ts
import { Body, Controller, Post, UnauthorizedException, Headers,BadRequestException} from '@nestjs/common';

import * as admin from 'firebase-admin';
import { AuthService } from './auth.service';
import { UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body('token') token: string) {
    try {
      console.log('Received token:', token); // Ajoutez ce log
      const decodedToken = await admin.auth().verifyIdToken(token);
      const email = decodedToken.email;
      console.log('Decoded token:', decodedToken); // Vérifiez si le token est valide

      if (!email) throw new UnauthorizedException('Email not found in token');
      let user = await this.userService.findByEmail(email);

      // ➡️ Si l'utilisateur n'existe pas, on le crée (Google sign-in)
      if (!user) {
        user = await this.authService.loginOrCreateUser(decodedToken);
      }

            if (!user) throw new UnauthorizedException('User not found');
      console.log('User role:', user.role, user.phoneNumber);
      // 🔒 Si admin avec 2FA activé
      if (user.role === UserRole.ADMIN && user.twoFactorEnabled) {
        return {
          twoFactorRequired: true,
          phoneNumber: user.phoneNumber,
          user: { role: user.role },
        };
      }
      // ✅ Sinon, login classique
      return {
        token: token,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          fname: user.fname,
          phoneNumber: user.phoneNumber,
        },
      };

    } catch (error) {
      throw new UnauthorizedException('Token Firebase invalide');
    }
  }

  @Post('signup')
  async signup(
    @Body('token') token: string,
    @Body('fname') fname: string,
    @Body('lname') lname: string,
    @Body('password') password: string,
  ) {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await this.authService.loginOrCreateUser(
      decodedToken,
      fname,
      lname,
      password
    );
    return user;
  }

  
  // ✅ Génére une URL OTP à transformer en QR code
  @Post('2fa/generate')
  async generate2FA(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    const otpauthUrl = await this.authService.generate2FASecret(user);
    return { otpauthUrl };
  }

  // ✅ Vérifie le code 2FA (sans l’activer)
  @Post('2fa/verify')
  async verify2FA(@Body('email') email: string, @Body('code') code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.twoFactorSecret)
      throw new BadRequestException(
        'Utilisateur non trouvé ou secret manquant',
      );

    const isValid = this.authService.verify2FACode(user, code);
    if (!isValid) throw new UnauthorizedException('Code invalide');
    return { valid: true };
  }

  // ✅ Active le 2FA
  @Post('2fa/enable')
  async enable2FA(@Body('email') email: string, @Body('code') code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.twoFactorSecret)
      throw new BadRequestException(
        'Utilisateur non trouvé ou secret manquant',
      );

    const isValid = this.authService.verify2FACode(user, code);
    if (!isValid) throw new UnauthorizedException('Code invalide');

    await this.authService.enable2FA(user);
    return { success: true };
  }

  // ✅ Désactive le 2FA
  @Post('2fa/disable')
  async disable2FA(@Body('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    await this.authService.disable2FA(user);
    return { success: true };
  }

/* zineb */
  /* meilleur approche 
@Post('get-user-id')
async getUserId(@Body('email') email: string) {
  try {
    return await this.authService.getUserIdByEmail(email);
  } catch (error) {
    throw new UnauthorizedException(error.message);
  }
}
  */
/* zineb */
@Post('get-user-id-by-token')
async getUserIdByToken(@Body('token') token: string) {
  try {
    const userId = await this.authService.getUserIdByToken(token);
    return { userId }; // Retourne un objet au lieu d'une string
  } catch (error) {
    throw new UnauthorizedException(error.message);
  }
}



}
