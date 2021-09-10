import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileImg } from 'src/user/interfaces/profile-image';

export class CreateUserDto {

  @ApiProperty({
    description: "user first name"
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "user last name"
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: "user email must be email and must be unique"
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "user password it will be hashed"
  })
  @IsString()
  @IsNotEmpty()
  password: string;



  @ApiProperty({ type: 'file' , description: "profileImg Returned as object of different sizes" })
  @IsNotEmpty()
  profileImg: ProfileImg


}
