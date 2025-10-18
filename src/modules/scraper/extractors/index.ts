import type { Page } from 'playwright';
import HKUExtractor from './hku';
import HKUSTExtractor from './hkust';

export type Extractor = {
    sourceName: string;
    url: string;
    scrape(page: Page): Promise<string[]>;
};

const extractors: Extractor[] = [HKUExtractor, HKUSTExtractor];

export default extractors;
