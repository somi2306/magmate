import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, UseGuards, ValidationPipe ,Request,Query } from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './entities/user.entity';
import UserRequestEntity from './entities/userrequest.entity';
import { UserRequestStatus } from './entities/userrequest.entity';  // Adaptez le chemin en fonction de la localisation de votre fichier
import { BadRequestException } from '@nestjs/common';
import { Delete } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Route pour obtenir le profil
  @Get('profile/:id')
  // @UseGuards(FirebaseAuthGuard)
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getProfile(id);
  }

  @Post()  
  async createUser(@Body(new ValidationPipe({ whitelist: true })  ) createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }


  @Get('uuid-by-email')
  async getUuidByEmail(@Query('email') email: string) {
    const uuid = await this.userService.getUuidByEmail(email);
    return { uuid }; // <- Objet contenant le champ `uuid`
  }

/* zineb */
  @UseGuards(FirebaseAuthGuard)
  @Post('send/:receiverId')
  async sendUserRequest(
    @Param('receiverId') receiverId: string,
    @Request() req,
  ): Promise<UserRequestEntity | { error: string }> {
    // Le payload Firebase est dans req.user
    return this.userService.sendUserRequest(receiverId, req.user);
  }

  @UseGuards(FirebaseAuthGuard) 
  @Get('send/status/:receiverId')
  getUserRequestStatus(
    @Param('receiverId') receiverId: string,
    @Request() req,
  ): Observable<{ status: string }> {
    const creator =  req.user;
    return this.userService.getUserRequestStatus(receiverId, creator);
  }
  
  @UseGuards(FirebaseAuthGuard) 
  @Put('send/response/:userRequestId')
  respondToUserRequest(
    @Param('userRequestId') userRequestStringId: string,
    @Body('status') statusResponse: UserRequestStatus, // Extract just the status field
  ): Observable<UserRequestStatus> {
    const userRequestId = parseInt(userRequestStringId);
    return this.userService.respondToUserRequest(
      statusResponse, // Now passing just the status
      userRequestId,
    );
  }

// In UserController
@UseGuards(FirebaseAuthGuard) 
@Get('send/me/received-requests')
getFriendRequestsFromRecipients(
  @Request() req,
): Observable<UserRequestEntity[]> {  // Changed from UserRequestStatus[] to UserRequestEntity[]
  return this.userService.getUserRequestsFromRecipients(req.user);
}

@Post('friends/my') // Changement de GET à POST pour envoyer un body
getFriends(@Body() body: { userId: string }) { // Reçoit l'ID dans le body
  console.log('User ID reçu:', body.userId);
  return this.userService.getUsers({ id: body.userId } as User); // Simule l'objet User
}

  @Get('count')
  async getUserCount(): Promise<number> {
    return await this.userService.getUserCount();
  }

    @Get('stats/by-role')
  async getUserCountByRole() {
    return this.userService.getUserCountByRole();
  }
/*
  //   avec firebase
  //   @Get('profile')
  //   @UseGuards(FirebaseAuthGuard)
  //   getProfile(@Request() req) {
  //      return this.userService.getProfile(req.user.id);  // une fois l'auth Firebase branchée
  //   }

  // // Route pour mettre à jour le profil
  // @Put('profile/:id')
  // async updateProfile(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto,
  // ) {
  //   return this.userService.updateProfile(id, updateUserDto);
  // }
*/
  //Route pour creer un utilisateur

  @Delete(':id')
@UseGuards(FirebaseAuthGuard)
async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
  return this.userService.deleteUser(id);
}

@Get()
@UseGuards(FirebaseAuthGuard) // ou retire ce guard pour tester plus vite
async getAllUsers(): Promise<User[]> {
  return this.userService.findAllUsers();
}

}
