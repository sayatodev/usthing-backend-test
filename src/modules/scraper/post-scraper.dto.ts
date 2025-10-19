export enum ScrapeAction {
    RUN = 'run',
    SYNC = 'sync',
}

export class PostScraperDto {
    action: ScrapeAction;
    sources?: string[];
}
