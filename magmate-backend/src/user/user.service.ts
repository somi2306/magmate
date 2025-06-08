import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import UserRequestEntity from './entities/userrequest.entity';

import { switchMap } from 'rxjs/operators';
import { UserRequestStatus } from './entities/userrequest.entity';
import { In } from 'typeorm';
import { tap } from 'rxjs/operators';
import { Not } from 'typeorm';
import { UserRole } from './entities/user.entity';
import * as admin from 'firebase-admin';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRequestEntity)
    private readonly userRequestRepository: Repository<UserRequestEntity>,
     private readonly mailService: MailService,
  ) {}

    async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
  
  async getProfile(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('Utilisateur non trouve', HttpStatus.NOT_FOUND);
    }

    return user;
  }
  async getUuidByEmail(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user.id;
  }


  findUserById(id: string): Observable<User> {
    const cleanId = id.trim();

    return from(
      this.userRepository.findOne({
        where: { id: cleanId },
        relations: ['avis', 'reclamations', 'magasins', 'sentUserRequests', 'receivedUserRequests'],
      })
    ).pipe(
      map((user: User) => {
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        delete user.password;
        return user;
      })
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new HttpException(
        " Cet email n'est pas valide ",
        HttpStatus.BAD_REQUEST,
      );
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }


  hasRequestBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Observable<boolean> {
    return from(
      this.userRequestRepository.findOne({
        where: [
          { creator: { id: creator.id }, receiver: { id: receiver.id } },
          { creator: { id: receiver.id }, receiver: { id: creator.id } },
        ],
      }),
    ).pipe(
      switchMap((userRequest: UserRequestEntity) => {
        if (!userRequest) return of(false);
        return of(true);
      }),
    );
  }

  // MODIFICATION ICI
  async sendUserRequest(
    receiverId: string,
    creatorPayload: any,
  ): Promise<UserRequestEntity | { error: string }> {
    const creator = await this.userRepository.findOne({
      where: { email: creatorPayload.email }
    });

    if (!creator) {
      return { error: 'Utilisateur créateur introuvable dans la base de données' };
    }

    if (receiverId === creator.id) {
      return { error: 'Impossible de vous envoyer une demande' };
    }

    const receiver = await this.userRepository.findOne({
      where: { id: receiverId }
    });

    if (!receiver) {
      return { error: 'Récepteur non trouvé' };
    }

    let userRequest = await this.userRequestRepository.findOne({
      where: [
        { creator: { id: creator.id }, receiver: { id: receiver.id } },
        { creator: { id: receiver.id }, receiver: { id: creator.id } },
      ],
    });

    if (userRequest) {
      // Si la requête existe déjà, on la met à jour au statut ACCEPTED
      if (userRequest.status !== UserRequestStatus.ACCEPTED) {
        userRequest.status = UserRequestStatus.ACCEPTED;
        return this.userRequestRepository.save(userRequest);
      }
      // Si elle est déjà ACCEPTED, on retourne la requête existante
      return userRequest;
    } else {
      // Si la requête n'existe pas, on la crée avec le statut ACCEPTED
      userRequest = this.userRequestRepository.create({
        creator: { id: creator.id },
        receiver: { id: receiver.id },
        status: UserRequestStatus.ACCEPTED
      });
      return this.userRequestRepository.save(userRequest);
    }
  }


  getUserRequestStatus(
    receiverId: string,
    currentUser: User,
  ): Observable<{ status: string }> {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return from(
          this.userRequestRepository.findOne({
            where: [
              { creator: { id: currentUser.id }, receiver: { id: receiver.id } },
              { creator: { id: receiver.id }, receiver: { id: currentUser.id } },
            ],
            relations: ['creator', 'receiver'],
          }),
        );
      }),
      map((userRequest: UserRequestEntity) => {
        if (!userRequest) {
          return { status: 'not-sent' };
        }

        if (userRequest.receiver.id === currentUser.id) {
          return { status: 'waiting-for-current-user-response' };
        }

        return { status: userRequest.status };
      }),
    );
  }

  getUserRequestUserById(userRequestId: number): Observable<UserRequestEntity> {
    return from(
      this.userRequestRepository.findOne({
        where: { id: userRequestId },
      })
    ).pipe(
      map((userRequest) => {
        if (!userRequest) {
          throw new HttpException('Demande non trouvée', HttpStatus.NOT_FOUND);
        }
        return userRequest;
      })
    );
  }

  respondToUserRequest(
    statusResponse: UserRequestStatus,
    userRequestId: number,
  ): Observable<UserRequestStatus> {
    return this.getUserRequestUserById(userRequestId).pipe(
      switchMap((userRequest: UserRequestEntity) => {
        if (!userRequest) {
          throw new HttpException('Demande non trouvée', HttpStatus.NOT_FOUND);
        }

        userRequest.status = statusResponse;

        return from(this.userRequestRepository.save(userRequest)).pipe(
          map((updatedRequest: UserRequestEntity) => updatedRequest.status),
        );
      }),
    );
  }

  getUserRequestsFromRecipients(
    currentUser: User,
  ): Observable<UserRequestEntity[]> {
    return from(
      this.userRequestRepository.find({
        where: [{ receiver: { id: currentUser.id } }],
        relations: ['receiver', 'creator'],
      }),
    );
  }


  getUsers(currentUser: User): Observable<User[]> {
    return from(
      this.userRequestRepository.find({
        where: [
          { creator: { id: currentUser.id }, status: UserRequestStatus.ACCEPTED },
          { receiver: { id: currentUser.id }, status: UserRequestStatus.ACCEPTED },
        ],
        relations: ['creator', 'receiver'],
      }),
    ).pipe(
      map((requests: UserRequestEntity[]) => {
        const userIds: string[] = [];

        for (const req of requests) {
          if (req.creator.id === currentUser.id) {
            userIds.push(req.receiver.id);
          } else {
            userIds.push(req.creator.id);
          }
        }

        return userIds;
      }),
      switchMap((userIds: string[]) => {
        if (userIds.length === 0) {
          return of([]);
        }

        return from(
          this.userRepository.find({
            where: { id: In(userIds) },
          }),
        );
      }),
      map((users: User[]) => {
        return users.map((user) => {
          delete user.password;
          return user;
        });
      }),
    );
  }

  async deleteUser(userId: string): Promise<void> {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('Utilisateur introuvable');
  }

  const email = user.email; // récupère l’email avant suppression

  // 🔐 Supprimer de Firebase Auth
  try {
    await admin.auth().deleteUser(userId);
  } catch (error) {
    console.warn('Erreur suppression Firebase:', error.message);
  }

  // 🗑️ Supprimer dans la BDD
  await this.userRepository.remove(user);

  // 📧 Envoyer l’email de notification
  const subject = 'Suppression de votre compte - Magmate';
  const body = `
    Bonjour ${user.fname ?? ''},

    Nous vous informons que votre compte utilisateur a été supprimé par l’administrateur de la plateforme Magmate.

    Si vous pensez qu’il s’agit d’une erreur ou si vous avez des questions, n’hésitez pas à nous contacter.

    Cordialement,
    L’équipe Magmate
  `;

  try {
    await this.mailService.sendContactEmail(email, subject, body, `<p>${body.replace(/\n/g, '<br>')}</p>`);
  } catch (err) {
    console.error('Erreur lors de l’envoi de l’email de suppression :', err);
  }
}


async findAllUsers(): Promise<User[]> {
  const users = await this.userRepository.find({
    where: { role: Not(UserRole.ADMIN) },
  });

  return users.map(user => {
    delete user.password;
    return user;
  });
}
  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }
  async getUserCountByRole(): Promise<{ role: UserRole; count: number }[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();
  }
}