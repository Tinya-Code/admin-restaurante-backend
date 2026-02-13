import { Controller, Get, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  search(
    @Query(new ValidationPipe({ transform: true }))
    query: SearchQueryDto,
  ): SearchResultDto {
    return this.searchService.search(query);
  }
}
