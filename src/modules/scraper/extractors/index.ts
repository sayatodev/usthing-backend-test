import type { Page } from 'playwright';
import HKUExtractor from './hku';
import HKUSTExtractor from './hkust';
import type { Prisma } from 'generated/prisma';

export type Extractor = {
    sourceName: string;
    url: string;
    scrape(page: Page): Promise<Prisma.CompetitionCreateInput[]>;
};

const extractors: Extractor[] = [HKUExtractor, HKUSTExtractor];

export default extractors;
