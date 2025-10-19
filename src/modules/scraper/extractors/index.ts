import type { CheerioAPI } from 'cheerio';
import HKUExtractor from './hku';
import HKUSTExtractor from './hkust';
import PolyUExtractor from './polyu';
import type { Prisma } from 'generated/prisma';

export type Extractor = {
    sourceName: string;
    url: string;
    scrape($: CheerioAPI): Prisma.CompetitionCreateInput[];
};

const extractorMap: Record<string, Extractor> = {
    hku: HKUExtractor,
    hkust: HKUSTExtractor,
    polyu: PolyUExtractor,
};

export const allExtractors: Extractor[] = [
    HKUExtractor,
    HKUSTExtractor,
    PolyUExtractor,
];

export function getExtractorBySource(sourceName: string): Extractor | null {
    if (sourceName in extractorMap) {
        return extractorMap[sourceName];
    }
    return null;
}

export function isValidSource(sourceName: string): boolean {
    return sourceName in extractorMap;
}
