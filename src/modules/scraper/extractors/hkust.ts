import type { Page } from 'playwright';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';

export const HKUSTExtractor: Extractor = {
    sourceName: 'HKUST',
    url: 'https://bmundergrad.hkust.edu.hk/announcement',

    scrape: async (page: Page) => {
        await page.waitForSelector('tr');
        const data = await page.$$eval(
            'td[data-title="Detail"] > span',
            (nodes) =>
                nodes
                    .map<Prisma.CompetitionCreateInput>((n) => ({
                        externalId:
                            n
                                .getElementsByTagName('a')[0]
                                ?.href.split('announcement/')
                                .at(-1) || '',
                        title:
                            n.getElementsByTagName('h3')[0]?.textContent || '',
                        url: n.getElementsByTagName('a')[0]?.href || '',
                        source: 'HKUST',
                    }))
                    .filter((x) => !!x.title),
        );
        return data;
    },
};
export default HKUSTExtractor;
