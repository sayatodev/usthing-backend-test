import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ScraperService } from './modules/scraper/scraper.service';

@Injectable()
export class OnBootstrapService implements OnApplicationBootstrap {
    constructor(private readonly scraper: ScraperService) {}

    onApplicationBootstrap() {
        void this.scraper.scrapeCompetitions();
    }
}
