import { Body, Controller, Get, HttpCode, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppRoles } from 'src/common/constants';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { VerifyUsersDto } from './dtos/verify-users.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags("Users")
@Controller('users')
export class UserController {
    constructor(
        private readonly _userService:UserService
    ){}


    @Get('/')
    async findUsers(){
        return await this._userService.find()
    }

    
    @Put('/verify')
    @Roles(AppRoles.ADMIN)
    @HttpCode(204)
    async verifyUser(
        @Body() verifyUsersDto: VerifyUsersDto
    ){
        await this._userService.verifyUser(verifyUsersDto)
    }
}
