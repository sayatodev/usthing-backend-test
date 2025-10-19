import {
    Body,
    Controller,
    HttpException,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import type { Prisma } from 'generated/prisma';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PostScraperDto, ScrapeAction } from './post-scraper.dto';

@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) {}

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 20 * 1000 /* 3 req / 20s */ } })
    @Post()
    async scrapeCompetitions(
        @Body() postScraperDto: PostScraperDto,
    ): Promise<Prisma.CompetitionCreateInput[]> {
        if (!(postScraperDto && postScraperDto.action)) {
            throw new HttpException('Action is required', 400);
        }

        const { action } = postScraperDto;
        if (!Object.values(ScrapeAction).includes(action)) {
            throw new HttpException('Invalid action', 400);
        }

        console.log(`Scrape action received: ${action}`);

        const { status, data } = await this.scraperService.scrapeCompetitions(
            action === ScrapeAction.SYNC,
        );
        if (status === 'success') {
            return data;
        } else {
            throw new Error('Scraping failed');
        }
    }
}
