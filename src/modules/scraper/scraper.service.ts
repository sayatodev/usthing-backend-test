import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import { normalizeText, isNearDuplicate } from './utils/similarities';
import extractors from './extractors';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScraperService {
    private readonly KEYWORDS = [
        'Case',
        'Challenge',
        'Competition',
        'Hackathon',
        'Datathon',
    ];

    constructor(private prisma: PrismaService) {}

    async scrapeCompetitions(): Promise<{
        status: 'success' | 'error';
        data: Prisma.CompetitionCreateInput[];
    }> {
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        try {
            let combined: Prisma.CompetitionCreateInput[] = [];
            for (const extractor of extractors) {
                await page.goto(extractor.url, {
                    waitUntil: 'domcontentloaded',
                });
                const results = await extractor.scrape(page);
                combined.push(...results);
            }
            combined = combined.filter((item) =>
                this.KEYWORDS.some((kw) =>
                    item.title.toLowerCase().includes(kw.toLowerCase()),
                ),
            );

            const unique: Prisma.CompetitionCreateInput[] = [];
            combined.forEach((item) => {
                const normTitle = normalizeText(item.title);
                const dup = unique.some((u) =>
                    isNearDuplicate(normTitle, u.title, 0.9),
                );
                if (!dup) unique.push(item);
            });
            await browser.close();
            await this.saveCompetitions(unique);
            return { status: 'success', data: unique };
        } catch (e) {
            console.error('Scraping failed:', e);
            return { status: 'error', data: [] };
        }
    }

    private async saveCompetitions(data: Prisma.CompetitionCreateInput[]) {
        await this.prisma.competition.createMany({ data }).catch((e) => {
            throw e;
        });
    }
}
