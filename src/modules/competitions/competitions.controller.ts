import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { Competition, Prisma } from 'generated/prisma';

@Controller('competitions')
export class CompetitionsController {
    constructor(private readonly competitionService: CompetitionService) {}

    // GET /competitions - Get all competitions with optional filters
    @Get()
    async getCompetitions(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('source') source?: string,
    ): Promise<Competition[]> {
        return this.competitionService.competitions({
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
            where: source ? { source } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }

    // GET /competitions/:id - Get a single competition by ID
    @Get(':id')
    async getCompetition(@Param('id') id: string): Promise<Competition | null> {
        return this.competitionService.competition({ id });
    }

    // POST /competitions - Create a new competition
    @Post()
    async createCompetition(
        @Body() data: Prisma.CompetitionCreateInput,
    ): Promise<Competition> {
        return this.competitionService.createCompetition(data);
    }

    // PUT /competitions/:id - Update a competition
    @Put(':id')
    async updateCompetition(
        @Param('id') id: string,
        @Body() data: Prisma.CompetitionUpdateInput,
    ): Promise<Competition> {
        return this.competitionService.updateCompetition({
            where: { id },
            data,
        });
    }

    // DELETE /competitions/:id - Delete a competition
    @Delete(':id')
    async deleteCompetition(@Param('id') id: string): Promise<Competition> {
        return this.competitionService.deleteCompetition({ id });
    }
}
