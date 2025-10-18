import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Competition } from 'generated/prisma';
import { CompetitionsController } from './competitions.controller';

describe('CompetitionsController', () => {
    let competitionsController: CompetitionsController;
    let competitionService: CompetitionService;

    const mockCompetition: Competition = {
        id: 'test-id-123',
        externalId: 'external-id-456',
        title: 'Test Competition',
        normalizedTitle: 'test competition',
        url: 'https://example.com',
        source: 'test-source',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [CompetitionsController],
            providers: [CompetitionService, PrismaService],
        }).compile();

        competitionsController = app.get<CompetitionsController>(
            CompetitionsController,
        );
        competitionService = app.get<CompetitionService>(CompetitionService);
    });

    describe('GET /competitions - getCompetitions', () => {
        it('should return an array of competitions', async () => {
            const serviceResult: Competition[] = [mockCompetition];

            jest.spyOn(competitionService, 'competitions').mockResolvedValue(
                serviceResult,
            );

            const result = await competitionsController.getCompetitions();
            expect(result).toHaveLength(1);
            expect(result[0]).not.toHaveProperty('normalizedTitle');
            expect(result[0].id).toBe(mockCompetition.id);
        });

        it('should call competitions service with default parameters', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions();

            expect(spy).toHaveBeenCalledWith({
                skip: undefined,
                take: undefined,
                where: {},
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should call competitions service with isCreatedAfter and limit parameters', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions('10', '20');

            expect(spy).toHaveBeenCalledWith({
                skip: 10,
                take: 20,
                where: {},
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should call competitions service with source filter', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions(
                undefined,
                undefined,
                'test-source',
            );

            expect(spy).toHaveBeenCalledWith({
                skip: undefined,
                take: undefined,
                where: { source: 'test-source' },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should call competitions service with keyword filter', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions(
                undefined,
                undefined,
                undefined,
                'case',
            );

            expect(spy).toHaveBeenCalledWith({
                skip: undefined,
                take: undefined,
                where: { title: { contains: 'case' } },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should call competitions service with source and keyword filters', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions(
                undefined,
                undefined,
                'test-source',
                'case',
            );

            expect(spy).toHaveBeenCalledWith({
                skip: undefined,
                take: undefined,
                where: { source: 'test-source', title: { contains: 'case' } },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should call competitions service with all parameters', async () => {
            const spy = jest
                .spyOn(competitionService, 'competitions')
                .mockResolvedValue([]);

            await competitionsController.getCompetitions(
                '5',
                '15',
                'test-source',
                'comp',
            );

            expect(spy).toHaveBeenCalledWith({
                skip: 5,
                take: 15,
                where: { source: 'test-source', title: { contains: 'comp' } },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('GET /competitions/:id - getCompetition', () => {
        it('should return a single competition without normalizedTitle', async () => {
            jest.spyOn(competitionService, 'competition').mockResolvedValue(
                mockCompetition,
            );

            const result =
                await competitionsController.getCompetition('test-id-123');

            expect(result).toBeDefined();
            expect(result.id).toBe('test-id-123');
            expect(result.title).toBe('Test Competition');
            expect(result).not.toHaveProperty('normalizedTitle');
        });

        it('should throw NotFoundException when competition not found', async () => {
            jest.spyOn(competitionService, 'competition').mockResolvedValue(
                null,
            );

            await expect(
                competitionsController.getCompetition('non-existent-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should call competition service with correct id', async () => {
            const spy = jest
                .spyOn(competitionService, 'competition')
                .mockResolvedValue(mockCompetition);

            await competitionsController.getCompetition('test-id-456');

            expect(spy).toHaveBeenCalledWith({ id: 'test-id-456' });
        });
    });
});
