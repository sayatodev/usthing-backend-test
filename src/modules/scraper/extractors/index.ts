import type { Page } from 'playwright';
import HKUExtractor from './hku';
import HKUSTExtractor from './hkust';
import PolyUExtractor from './polyu';
import type { Prisma } from 'generated/prisma';

export type Extractor = {
    sourceName: string;
    url: string;
    scrape(page: Page): Promise<Prisma.CompetitionCreateInput[]>;
};

const extractors: Extractor[] = [HKUExtractor, HKUSTExtractor, PolyUExtractor];

export default extractors;
