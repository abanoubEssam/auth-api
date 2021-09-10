import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';
import { IsLongitude } from '../validators/is-lng.validator';
import { Type } from 'class-transformer';
import { IsLatitude } from '../validators/is-lat.validator';


export class LocationDto {
	@ApiProperty()
	@IsDefined()
	@IsNotEmpty()
	@IsNumber()
	@IsLongitude()
	@Type(() => Number)
	lng: number;

	@ApiProperty()
	@IsDefined()
	@IsNotEmpty()
	@IsNumber()
	@IsLatitude()
	@Type(() => Number)
	lat: number;
}