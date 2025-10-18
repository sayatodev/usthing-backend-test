import { Injectable } from '@nestjs/common';
import { chromium, Page } from 'playwright';

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

    private normalizeText(text: string): string {
        let t = text.toLowerCase();
        t = t.replace(/[^\w\s]/g, '');
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    }

    private sanitizeOutput(text: string): string {
        // Remove non-ascii safely without control-char class ranges that lint flags
        let t = text
            .split('')
            .filter((ch) => ch.charCodeAt(0) <= 127)
            .join('');
        t = t.replace(/[^a-zA-Z0-9\s]/g, '');
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    }

    private levenshteinDistance(a: string, b: string): number {
        const m = a.length;
        const n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        const dp: number[][] = Array.from({ length: m + 1 }, () =>
            new Array<number>(n + 1).fill(0),
        );
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost =
                    a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost,
                );
            }
        }
        return dp[m][n];
    }

    private similarityRatio(a: string, b: string): number {
        if (!a && !b) return 1;
        const maxLen = Math.max(a.length, b.length) || 1;
        const dist = this.levenshteinDistance(a, b);
        return 1 - dist / maxLen;
    }

    private isNearDuplicate(a: string, b: string, threshold = 0.9): boolean {
        return this.similarityRatio(a, b) >= threshold;
    }

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
                const norm = this.normalizeText(text);
                const dup = unique.some((u) =>
                    this.isNearDuplicate(norm, u.normalized, 0.9),
                );
                if (!dup)
                    unique.push({ idx, original: text, normalized: norm });
            });
            return {
                status: 'success',
                data: unique.map((u) => this.sanitizeOutput(u.original)),
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
