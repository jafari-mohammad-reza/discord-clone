import { Channel as ChannelType } from '@prisma/client/generated';
import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class Channel implements ChannelType {
  id: string;
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 || value === '1';
  })
  @ApiProperty({ type: Boolean, required: true, default: true })
  isPublic: boolean;
  @IsUUID()
  ownerId: string;
  @IsUUID()
  @ApiProperty({ type: String, required: true })
  categoryId: string;
  @IsString()
  @ApiProperty({ type: String, required: true })
  title: string;
  @IsString()
  logo: string;
  logoPath: string | null;
}
