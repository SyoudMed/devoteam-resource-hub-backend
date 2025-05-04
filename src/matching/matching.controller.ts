import { Controller, Get, Param } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('match/:offreId')
  match(@Param('offreId') offreId: number) {
    return this.matchingService.match(+offreId);
  }
}
