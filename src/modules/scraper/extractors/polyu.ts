import type { Page } from 'playwright';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';
import { normalizeText } from '../utils/similarities';

export const PolyUExtractor: Extractor = {
    sourceName: 'PolyU',
    url: 'https://www.polyu.edu.hk/af/experience-and-opportunities/student-competitions/',

    scrape: async (page: Page) => {
        await page.waitForSelector(
            '.static-table--fullWidth--border--zebra:first-of-type tr:not(:first-of-type) td:first-of-type',
        );
        const data = await page.$$eval(
            '.static-table--fullWidth--border--zebra:first-of-type tr:not(:first-of-type) td:first-of-type a',
            (nodes: HTMLAnchorElement[]) =>
                nodes
                    .map<
                        Omit<Prisma.CompetitionCreateInput, 'normalizedTitle'>
                    >((n) => ({
                        title: (n.textContent || '').trim(),
                        url: n.href,
                        source: 'PolyU',
                    }))
                    .filter((x) => !!x.title),
        );
        return data.map((item) => ({
            ...item,
            normalizedTitle: normalizeText(item.title),
        }));
    },
};
export default PolyUExtractor;
