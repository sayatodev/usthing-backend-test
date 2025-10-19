import { Controller, Post, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import type { Prisma } from 'generated/prisma';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) {}

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 20 * 1000 /* 3 req / 20s */ } })
    @Post()
    async scrapeCompetitions(): Promise<Prisma.CompetitionCreateInput[]> {
        const { status, data } = await this.scraperService.scrapeCompetitions();
        if (status === 'success') {
            return data;
        } else {
            throw new Error('Scraping failed');
        }
    }
}
