import type { CheerioAPI } from 'cheerio';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';
import { normalizeText } from '../utils/similarities';

export const HKUSTExtractor: Extractor = {
    sourceName: 'HKUST',
    url: 'https://bmundergrad.hkust.edu.hk/announcement',

    scrape: ($: CheerioAPI) => {
        const data = $('td[data-title="Detail"] > span')
            .toArray()
            .map<Omit<Prisma.CompetitionCreateInput, 'normalizedTitle'>>(
                (el) => {
                    const a = $(el).find('a').first();
                    const href = a.attr('href') || '';
                    const title = $(el).find('h3').first().text() || '';
                    return {
                        externalId: href.split('announcement/').at(-1) || '',
                        title,
                        url: href,
                        source: 'HKUST',
                    };
                },
            )
            .filter((x) => !!x.title);
        return data.map((item) => ({
            ...item,
            normalizedTitle: normalizeText(item.title),
        }));
    },
};
export default HKUSTExtractor;
