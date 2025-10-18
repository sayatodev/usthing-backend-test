import { Injectable } from '@nestjs/common';
import { chromium, Page } from 'playwright';
import {
    normalizeText,
    sanitizeOutput,
    isNearDuplicate,
} from './utils/similarities';

@Injectable()
export class ScraperService {
    private readonly HKUST_URL =
        'https://bmundergrad.hkust.edu.hk/announcement';
    private readonly HKU_URL = 'https://ug.hkubs.hku.hk/competition';
    private readonly KEYWORDS = [
        'Case',
        'Challenge',
        'Competition',
        'Hackathon',
        'Datathon',
    ];

    // text/similarity helpers moved to ./utils/similarities

    private async unsafeScrapeHKUST(page: Page): Promise<string[]> {
        await page.goto(this.HKUST_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('tr');
        const titles = await page.$$eval('tr h3', (nodes) =>
            Array.from(nodes)
                .map((n) => (n.textContent || '').trim())
                .filter((x) => !!x),
        );
        const keywordsLower = this.KEYWORDS.map((k) => k.toLowerCase());
        return titles
            .filter((t) =>
                keywordsLower.some((k) => t.toLowerCase().includes(k)),
            )
            .map((t) => `${t} [UST]`);
    }

    private async unsafeScrapeHKU(page: Page): Promise<string[]> {
        await page.goto(this.HKU_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('a.card-blk__item').catch(() => void 0);
        const titles = await page.$$eval(
            'a.card-blk__item p.card-blk__title',
            (nodes) =>
                Array.from(nodes)
                    .map((n) => (n.textContent || '').trim())
                    .filter((x) => !!x),
        );
        return titles.map((t) => `${t} [HKU]`);
    }

    async scrapeCompetitions(): Promise<{
        status: 'success' | 'error';
        data: string[];
    }> {
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();
        try {
            const [hkust, hku] = [
                await this.unsafeScrapeHKUST(page),
                await this.unsafeScrapeHKU(page),
            ];
            const combined = [...hkust, ...hku];
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
