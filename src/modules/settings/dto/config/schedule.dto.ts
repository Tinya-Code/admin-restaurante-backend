import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { BusinessHoursDto } from './business-config.dto';

export class ScheduleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Monday schedule',
    type: BusinessHoursDto,
  })
  monday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Tuesday schedule',
    type: BusinessHoursDto,
  })
  tuesday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Wednesday schedule',
    type: BusinessHoursDto,
  })
  wednesday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Thursday schedule',
    type: BusinessHoursDto,
  })
  thursday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Friday schedule',
    type: BusinessHoursDto,
  })
  friday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Saturday schedule',
    type: BusinessHoursDto,
  })
  saturday?: BusinessHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @ApiProperty({
    description: 'Sunday schedule',
    type: BusinessHoursDto,
  })
  sunday?: BusinessHoursDto;
}
