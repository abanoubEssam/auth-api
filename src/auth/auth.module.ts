import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: config.get('auth.jwtSecret'),
      signOptions: { expiresIn: config.get('auth.jwtLifeTime')},
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
