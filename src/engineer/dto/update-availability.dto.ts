import { IsEnum } from 'class-validator';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';

export class UpdateAvailabilityDto {
    @IsEnum(AvailabilityStatus)
    disponibiliteStatus: AvailabilityStatus;
}