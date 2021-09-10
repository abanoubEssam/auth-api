import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto  {

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	page?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	limit?: number;
}
