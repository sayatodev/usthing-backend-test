import type { Page } from 'playwright';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';

export const HKUSTExtractor: Extractor = {
    sourceName: 'HKUST',
    url: 'https://bmundergrad.hkust.edu.hk/announcement',

    scrape: async (page: Page) => {
        await page.waitForSelector('tr');
        const titles = await page.$$eval('tr h3', (nodes) =>
            Array.from(nodes)
                .map((n) => (n.textContent || '').trim())
                .filter((x) => !!x),
        );
        return titles.map<Prisma.CompetitionCreateInput>((title) => ({
            title,
            source: 'HKUST',
        }));
    },
};
export default HKUSTExtractor;
