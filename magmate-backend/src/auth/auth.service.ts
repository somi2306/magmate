import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async loginOrCreateUser(
    decodedToken: admin.auth.DecodedIdToken,
    fnameFromForm?: string,
    lnameFromForm?: string,
    passwordFromForm?: string,
  ): Promise<User> {
    const { email, name, picture,firebase } = decodedToken;

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      const fname = fnameFromForm ?? (name?.split(' ')[0] || 'Inconnu');
      const lname =
        lnameFromForm ?? (name?.split(' ').slice(1).join(' ') || '');

      const isGoogleSignUp = firebase?.sign_in_provider === 'google.com';

      let hashedPassword: string | undefined;

      if (!isGoogleSignUp) {
        if (!passwordFromForm) {
          throw new Error("Mot de passe requis pour l'inscription.");
        }
        hashedPassword = await bcrypt.hash(passwordFromForm, 10);
      }
      user = this.userRepo.create({
        email,
        fname,
        lname,
        photo: picture,
        password: hashedPassword,
      });

      await this.userRepo.save(user);
    }

    return user;
  }

    // ✅ Générer le secret 2FA pour l’utilisateur
  async generate2FASecret(user: User): Promise<string> {
    const secret = speakeasy.generateSecret({
      name: `gestion-hoteliere (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    await this.userRepo.save(user);

    return secret.otpauth_url; // à transformer en QR code côté frontend
  }

  // ✅ Activer le 2FA
  async enable2FA(user: User): Promise<void> {
    user.twoFactorEnabled = true;
    await this.userRepo.save(user);
  }

  // ✅ Désactiver le 2FA
  async disable2FA(user: User): Promise<void> {
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await this.userRepo.save(user);
  }

  // ✅ Vérifier le code TOTP
  verify2FACode(user: User, code: string): boolean {
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1, // autorise un décalage léger dans le temps
    });
  }
/* zineb */
// Dans auth.service.ts
  /* meilleur approche 
async getUserIdByEmail(email: string): Promise<string> {
  const user = await this.userRepo.findOne({ where: { email } });
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user.id; // Supposant que votre entité User a une colonne 'id' (UUID)
}*/
/* zineb */
async getUserIdByToken(token: string): Promise<string> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await this.userRepo.findOne({ where: { email: decodedToken.email } });
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user.id;
  } catch (error) {
    throw new Error('Token Firebase invalide ou utilisateur non trouvé');
  }
}

  
  }
