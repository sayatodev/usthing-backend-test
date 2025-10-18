import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import {
    normalizeText,
    sanitizeOutput,
    isNearDuplicate,
} from './utils/similarities';
import extractors from './extractors';

@Injectable()
export class ScraperService {
    private readonly KEYWORDS = [
        'Case',
        'Challenge',
        'Competition',
        'Hackathon',
        'Datathon',
    ];

    async scrapeCompetitions(): Promise<{
        status: 'success' | 'error';
        data: string[];
    }> {
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();
        try {
            let combined: string[] = [];
            for (const extractor of extractors) {
                await page.goto(extractor.url, {
                    waitUntil: 'domcontentloaded',
                });
                const results = await extractor.scrape(page);
                combined = [...combined, ...results];
            }
            combined = combined.filter((text) =>
                this.KEYWORDS.some((kw) =>
                    text.toLowerCase().includes(kw.toLowerCase()),
                ),
            );

            const unique: {
                idx: number;
                original: string;
                normalized: string;
            }[] = [];
            combined.forEach((text, idx) => {
                const norm = normalizeText(text);
                const dup = unique.some((u) =>
                    isNearDuplicate(norm, u.normalized, 0.9),
                );
                if (!dup)
                    unique.push({ idx, original: text, normalized: norm });
            });
            return {
                status: 'success',
                data: unique.map((u) => sanitizeOutput(u.original)),
            };
        } catch (e) {
            console.error('Scraping failed:', e);
            return { status: 'error', data: [] };
        } finally {
            try {
                await browser.close();
            } catch (e) {
                console.error('Failed to close browser:', e);
            }
        }
    }
}
