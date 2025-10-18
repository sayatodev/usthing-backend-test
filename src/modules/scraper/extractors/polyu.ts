import type { CheerioAPI } from 'cheerio';
import type { Extractor } from '.';
import type { Prisma } from 'generated/prisma';
import { normalizeText } from '../utils/similarities';

export const PolyUExtractor: Extractor = {
    sourceName: 'PolyU',
    url: 'https://www.polyu.edu.hk/af/experience-and-opportunities/student-competitions/',

    scrape: ($: CheerioAPI) => {
        const data = $(
            '.static-table--fullWidth--border--zebra:first-of-type tr:not(:first-of-type) td:first-of-type a',
        )
            .toArray()
            .map<Omit<Prisma.CompetitionCreateInput, 'normalizedTitle'>>(
                (el) => {
                    const href = $(el).attr('href') || '';
                    const title = ($(el).text() || '').trim();
                    return {
                        title,
                        url: href,
                        source: 'PolyU',
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
export default PolyUExtractor;
