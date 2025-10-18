import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('competitions')
  async scrapeCompetitions(): Promise<string[]> {
    const { status, data } = await this.scraperService.scrapeCompetitions();
    if (status === 'success') {
      return data;
    } else {
      throw new Error('Scraping failed');
    }
  }
}
