import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileImg } from 'src/user/interfaces/profile-image';

export class VerifyUsersDto {

  @ApiProperty({
      description: "should be array of mongodb ids"
  })
  @IsArray()
  @IsNotEmpty()
  userIds: string[];


}
