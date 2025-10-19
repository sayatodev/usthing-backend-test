import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';
import https from 'node:https';
import { normalizeText, isNearDuplicate } from './utils/similarities';
import extractors from './extractors';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';

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
        try {
            const client = axios.create({
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });

            let combined: Prisma.CompetitionCreateInput[] = [];
            for (const extractor of extractors) {
                const resp = await client.get(extractor.url, {
                    timeout: 20000,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    },
                    validateStatus: (s) => s >= 200 && s < 400,
                });
                const $ = load(resp.data);
                const results = extractor.scrape($);
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
            await this.saveCompetitions(unique);
            return { status: 'success', data: unique };
        } catch (e) {
            console.error('Scraping failed:', e);
            return { status: 'error', data: [] };
        }
    }

    private async saveCompetitions(data: Prisma.CompetitionCreateInput[]) {
        // check recent 100 records for similarity to avoid duplicates
        const recent = await this.prisma.competition.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        console.log(`recent:`, recent, data.length);
        const filtered = data.filter((item) => {
            const normTitle = normalizeText(item.title);
            const dup = recent.some((r) =>
                isNearDuplicate(normTitle, r.normalizedTitle, 0.9),
            );
            return !dup;
        });
        console.log(`filtered:`, filtered, filtered.length);

        // insert filtered records and ignore duplicates
        for (const item of filtered) {
            try {
                await this.prisma.competition.create({
                    data: item,
                });
            } catch {
                console.warn(
                    `Failed to insert competition ${item.title} (possible duplicate):`,
                );
            }
        }
    }
}
