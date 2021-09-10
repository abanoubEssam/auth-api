import { Body, Controller, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { HandleImagesInterceptor } from 'src/common/interceptors/handle-imgs.interceptor';
import { UploadField } from 'src/common/interceptors/images-interceptor/interfaces/image-interceptor.interface';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
@ApiTags('Auth')
@Public()
export class AuthController {
  constructor(
    private readonly _authService: AuthService
  ) { }

  static getImagesFields = (): UploadField[] => [
    {
      name: 'profileImg',
      maxCount: 1,
      optional: false,
      resizeOptions: {
        medium: true,
        thumbnail: true
      }
    }
  ];



  @Post('sign-up')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(AuthController.getImagesFields()),
    HandleImagesInterceptor(AuthController.getImagesFields()),
  )
  async createUserWithPassword(
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this._authService.createUserWithPassword(createUserDto)
  }


  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: Request,
    @Body() loginDto: LoginDto // to share it with swagger
  ) {
    return (req as Request | any).user;
  }



}
