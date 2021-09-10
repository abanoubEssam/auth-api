import { Injectable } from '@nestjs/common';
import { comparePasswords } from 'src/common/utils/hash-password';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class AuthService {

	constructor(
		private readonly _userService: UserService
	){}

	async createUserWithPassword(
		createUserDto: CreateUserDto
	){
		return await this._userService.createUser(createUserDto)
	}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this._userService.findOne({email});
		if (user && await comparePasswords(pass, user.password)) {
		  const { password, ...result } = user;
		  return result;
		}
		return null;
	  }

}
