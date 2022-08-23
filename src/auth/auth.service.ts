import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        // token: this.getJwtToken({ email: user.email, id: user.id })
        token: this.getJwtToken({ id: user.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }


  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne(
      {
        where: { email },
        select: { email: true, password: true, id: true }
      });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      ...user,
      // token: this.getJwtToken({ email: user.email, id: user.id })
      token: this.getJwtToken({ id: user.id })
    };
  }


  async checkAuthStatus(user: User) {
    // retornar: id, email, password, fullname, new token
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }


  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDBErrors(error: any): never {
    if (error.code == '23505') {
      console.log(error);
      throw new BadRequestException(error.detail);
    } else {
      throw new InternalServerErrorException('Check server log');
    }
  }

}
