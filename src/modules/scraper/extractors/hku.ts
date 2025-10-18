import type { Page } from 'playwright';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';
import { normalizeText } from '../utils/similarities';

export const HKUExtractor: Extractor = {
    sourceName: 'HKU',
    url: 'https://ug.hkubs.hku.hk/competition',

    scrape: async (page: Page) => {
        await page.waitForSelector('a.card-blk__item');
        const data = await page.$$eval(
            'a.card-blk__item',
            (nodes: HTMLAnchorElement[]) =>
                nodes
                    .map<
                        Omit<Prisma.CompetitionCreateInput, 'normalizedTitle'>
                    >((n) => ({
                        externalId: n.href.split('/competition/').at(-1) || '',
                        title: (
                            n.getElementsByClassName('card-blk__title')[0]
                                ?.textContent || ''
                        ).trim(),
                        url: n.href,
                        source: 'HKU',
                    }))
                    .filter((x) => !!x.title),
        );
        return data.map((item) => ({
            ...item,
            normalizedTitle: normalizeText(item.title),
        }));
    },
};
export default HKUExtractor;
