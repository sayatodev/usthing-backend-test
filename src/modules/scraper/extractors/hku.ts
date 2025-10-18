import type { Page } from 'playwright';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';

export const HKUExtractor: Extractor = {
    sourceName: 'HKU',
    url: 'https://ug.hkubs.hku.hk/competition',

    scrape: async (page: Page) => {
        await page.waitForSelector('a.card-blk__item');
        const titles = await page.$$eval(
            'a.card-blk__item p.card-blk__title',
            (nodes) =>
                Array.from(nodes)
                    .map((n) => (n.textContent || '').trim())
                    .filter((x) => !!x),
        );
        return titles.map<Prisma.CompetitionCreateInput>((title) => ({
            title,
            source: 'HKU',
        }));
    },
};
export default HKUExtractor;
