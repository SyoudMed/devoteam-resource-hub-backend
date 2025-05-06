import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}


  @Roles(UserRole.COMMERCIAL)
  @Get('match/:offreId')
  match(@Param('offreId') offreId: number) {
    return this.matchingService.match(+offreId);
  }

  @Roles(UserRole.COMMERCIAL)
  @Get('matchresult/:offreId')
  async getMatchesByOffreId(@Param('offreId', ParseIntPipe) offreId: number) {
    return this.matchingService.getMatchesByOffreId(offreId);
  }
}