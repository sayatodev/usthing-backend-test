import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [ScraperController],
    providers: [ScraperService, PrismaService],
    exports: [ScraperService],
})
export class ScraperModule {}
