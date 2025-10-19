import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScrapeAction } from './post-scraper.dto';

describe('ScraperController', () => {
    let scraperController: ScraperController;
    let scraperService: ScraperService;

    const mockCompetitionCreateInput: Prisma.CompetitionCreateInput = {
        externalId: 'external-id-123',
        title: 'Test Competition',
        normalizedTitle: 'test competition',
        url: 'https://example.com',
        source: 'test-source',
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [
                ThrottlerModule.forRoot([
                    {
                        ttl: 0,
                        limit: 0,
                    },
                ]),
            ],
            controllers: [ScraperController],
            providers: [ScraperService, PrismaService],
        }).compile();

        scraperController = app.get<ScraperController>(ScraperController);
        scraperService = app.get<ScraperService>(ScraperService);
    });

    describe('POST /scraper - scrapeCompetitions', () => {
        it('should return an array of competition create inputs on success', async () => {
            const serviceResult = {
                status: 'success' as const,
                data: [mockCompetitionCreateInput],
            };

            jest.spyOn(scraperService, 'scrapeCompetitions').mockResolvedValue(
                serviceResult,
            );

            const result = await scraperController.scrapeCompetitions({
                action: ScrapeAction.RUN,
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockCompetitionCreateInput);
        });

        it('should throw an error when scraping fails', async () => {
            const serviceResult = {
                status: 'error' as const,
                data: [],
            };

            jest.spyOn(scraperService, 'scrapeCompetitions').mockResolvedValue(
                serviceResult,
            );

            await expect(
                scraperController.scrapeCompetitions({
                    action: ScrapeAction.RUN,
                }),
            ).rejects.toThrow('Scraping failed');
        });

        it('should call scrapeCompetitions service method', async () => {
            const serviceResult = {
                status: 'success' as const,
                data: [mockCompetitionCreateInput],
            };

            const spy = jest
                .spyOn(scraperService, 'scrapeCompetitions')
                .mockResolvedValue(serviceResult);

            await scraperController.scrapeCompetitions({
                action: ScrapeAction.RUN,
            });

            expect(spy).toHaveBeenCalled();
        });

        it('should call scrapeCompetitions service with sources filter', async () => {
            const serviceResult = {
                status: 'success' as const,
                data: [mockCompetitionCreateInput],
            };

            const spy = jest
                .spyOn(scraperService, 'scrapeCompetitions')
                .mockResolvedValue(serviceResult);

            await scraperController.scrapeCompetitions({
                action: ScrapeAction.RUN,
                sources: ['hku', 'hkust'],
            });

            expect(spy).toHaveBeenCalledWith(false, ['hku', 'hkust']);
        });

        it('should throw an error when invalid source name is given', async () => {
            await expect(
                scraperController.scrapeCompetitions({
                    action: ScrapeAction.RUN,
                    sources: ['invalid-source', 'another-invalid'],
                }),
            ).rejects.toThrow(
                'Invalid source name(s): invalid-source, another-invalid',
            );
        });

        it('should throw an error when one source is valid and one is invalid', async () => {
            await expect(
                scraperController.scrapeCompetitions({
                    action: ScrapeAction.RUN,
                    sources: ['hku', 'invalid-source'],
                }),
            ).rejects.toThrow('Invalid source name(s): invalid-source');
        });
    });
});
