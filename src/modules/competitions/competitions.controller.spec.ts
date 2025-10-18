import { Test, TestingModule } from '@nestjs/testing';
import { CompetitionService } from './competition.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Competition } from 'generated/prisma';
import { CompetitionsController } from './competitions.controller';

describe('CompetitionsController', () => {
  let competitionsController: CompetitionsController;
  let competitionService: CompetitionService;

  const mockCompetition: Competition = {
    id: 'test-id-123',
    title: 'Test Competition',
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
      const result: Competition[] = [mockCompetition];
      jest.spyOn(competitionService, 'competitions').mockResolvedValue(result);

      expect(await competitionsController.getCompetitions()).toBe(result);
    });

    it('should call competitions service with default parameters', async () => {
      const spy = jest
        .spyOn(competitionService, 'competitions')
        .mockResolvedValue([]);

      await competitionsController.getCompetitions();

      expect(spy).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should call competitions service with skip and take parameters', async () => {
      const spy = jest
        .spyOn(competitionService, 'competitions')
        .mockResolvedValue([]);

      await competitionsController.getCompetitions('10', '20');

      expect(spy).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
        where: undefined,
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

    it('should call competitions service with all parameters', async () => {
      const spy = jest
        .spyOn(competitionService, 'competitions')
        .mockResolvedValue([]);

      await competitionsController.getCompetitions('5', '15', 'test-source');

      expect(spy).toHaveBeenCalledWith({
        skip: 5,
        take: 15,
        where: { source: 'test-source' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('GET /competitions/:id - getCompetition', () => {
    it('should return a single competition by id', async () => {
      jest
        .spyOn(competitionService, 'competition')
        .mockResolvedValue(mockCompetition);

      const result = await competitionsController.getCompetition('test-id-123');

      expect(result).toBe(mockCompetition);
    });

    it('should call competition service with correct id', async () => {
      const spy = jest
        .spyOn(competitionService, 'competition')
        .mockResolvedValue(mockCompetition);

      await competitionsController.getCompetition('test-id-123');

      expect(spy).toHaveBeenCalledWith({ id: 'test-id-123' });
    });

    it('should return null when competition is not found', async () => {
      jest.spyOn(competitionService, 'competition').mockResolvedValue(null);

      const result =
        await competitionsController.getCompetition('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('POST /competitions - createCompetition', () => {
    it('should create a new competition', async () => {
      const createData = {
        title: 'New Competition',
        url: 'https://example.com',
        source: 'test-source',
      };

      jest
        .spyOn(competitionService, 'createCompetition')
        .mockResolvedValue(mockCompetition);

      const result = await competitionsController.createCompetition(createData);

      expect(result).toBe(mockCompetition);
    });

    it('should call createCompetition service with correct data', async () => {
      const createData = {
        title: 'New Competition',
        url: 'https://example.com',
        source: 'test-source',
      };

      const spy = jest
        .spyOn(competitionService, 'createCompetition')
        .mockResolvedValue(mockCompetition);

      await competitionsController.createCompetition(createData);

      expect(spy).toHaveBeenCalledWith(createData);
    });

    it('should create competition with minimal required fields', async () => {
      const createData = {
        title: 'Minimal Competition',
      };

      const minimalCompetition = {
        ...mockCompetition,
        title: 'Minimal Competition',
        url: null,
        source: null,
      };

      const spy = jest
        .spyOn(competitionService, 'createCompetition')
        .mockResolvedValue(minimalCompetition);

      const result = await competitionsController.createCompetition(createData);

      expect(spy).toHaveBeenCalledWith(createData);
      expect(result).toBe(minimalCompetition);
    });
  });

  describe('PUT /competitions/:id - updateCompetition', () => {
    it('should update an existing competition', async () => {
      const updateData = {
        title: 'Updated Competition',
      };

      const updatedCompetition = {
        ...mockCompetition,
        title: 'Updated Competition',
      };

      jest
        .spyOn(competitionService, 'updateCompetition')
        .mockResolvedValue(updatedCompetition);

      const result = await competitionsController.updateCompetition(
        'test-id-123',
        updateData,
      );

      expect(result).toBe(updatedCompetition);
    });

    it('should call updateCompetition service with correct parameters', async () => {
      const updateData = {
        title: 'Updated Competition',
        url: 'https://updated.com',
      };

      const spy = jest
        .spyOn(competitionService, 'updateCompetition')
        .mockResolvedValue(mockCompetition);

      await competitionsController.updateCompetition('test-id-123', updateData);

      expect(spy).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: updateData,
      });
    });

    it('should update only specified fields', async () => {
      const updateData = {
        source: 'updated-source',
      };

      const spy = jest
        .spyOn(competitionService, 'updateCompetition')
        .mockResolvedValue(mockCompetition);

      await competitionsController.updateCompetition('test-id-123', updateData);

      expect(spy).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: updateData,
      });
    });
  });

  describe('DELETE /competitions/:id - deleteCompetition', () => {
    it('should delete a competition by id', async () => {
      jest
        .spyOn(competitionService, 'deleteCompetition')
        .mockResolvedValue(mockCompetition);

      const result =
        await competitionsController.deleteCompetition('test-id-123');

      expect(result).toBe(mockCompetition);
    });

    it('should call deleteCompetition service with correct id', async () => {
      const spy = jest
        .spyOn(competitionService, 'deleteCompetition')
        .mockResolvedValue(mockCompetition);

      await competitionsController.deleteCompetition('test-id-123');

      expect(spy).toHaveBeenCalledWith({ id: 'test-id-123' });
    });

    it('should return deleted competition data', async () => {
      const deletedCompetition = { ...mockCompetition };

      jest
        .spyOn(competitionService, 'deleteCompetition')
        .mockResolvedValue(deletedCompetition);

      const result =
        await competitionsController.deleteCompetition('test-id-123');

      expect(result).toEqual(deletedCompetition);
    });
  });
});
