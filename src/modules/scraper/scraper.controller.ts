import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import type { Prisma } from 'generated/prisma';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PostScraperDto, ScrapeAction } from './post-scraper.dto';
import { isValidSource } from './extractors';

@Controller('scraper')
export class ScraperController {
    constructor(private readonly scraperService: ScraperService) {}

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 20 * 1000 /* 3 req / 20s */ } })
    @HttpCode(200)
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

        // Validate source names if provided
        if (postScraperDto.sources && postScraperDto.sources.length > 0) {
            const invalidSources = postScraperDto.sources.filter(
                (source) => !isValidSource(source),
            );
            if (invalidSources.length > 0) {
                throw new HttpException(
                    `Invalid source name(s): ${invalidSources.join(', ')}`,
                    400,
                );
            }
        }

        console.log(`Scrape action received: ${action}`);

        const { status, data } = await this.scraperService.scrapeCompetitions(
            action === ScrapeAction.SYNC,
            postScraperDto.sources,
        );
        if (status === 'success') {
            return data;
        } else {
            throw new Error('Scraping failed');
        }
    }
}
