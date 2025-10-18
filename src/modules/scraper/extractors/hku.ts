import type { CheerioAPI } from 'cheerio';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';
import { normalizeText } from '../utils/similarities';

export const HKUExtractor: Extractor = {
    sourceName: 'HKU',
    url: 'https://ug.hkubs.hku.hk/competition',

    scrape: ($: CheerioAPI) => {
        const data = $('a.card-blk__item')
            .toArray()
            .map<Omit<Prisma.CompetitionCreateInput, 'normalizedTitle'>>(
                (el) => {
                    const href = $(el).attr('href') || '';
                    const title = $(el).find('.card-blk__title').text().trim();
                    return {
                        externalId: href.split('/competition/').at(-1) || '',
                        title,
                        url: href,
                        source: 'HKU',
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
export default HKUExtractor;
