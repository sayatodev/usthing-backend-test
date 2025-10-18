import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import type { Prisma } from 'generated/prisma';

@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) {}

    @Get('competitions')
    async scrapeCompetitions(): Promise<Prisma.CompetitionCreateInput[]> {
        const { status, data } = await this.scraperService.scrapeCompetitions();
        if (status === 'success') {
            return data;
        } else {
            throw new Error('Scraping failed');
        }
    }
}
