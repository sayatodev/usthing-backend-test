import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { Competition, type Prisma } from 'generated/prisma';

@Controller('competitions')
export class CompetitionsController {
    constructor(private readonly competitionService: CompetitionService) {}

    // GET /competitions - Get all competitions with optional filters
    @Get()
    async getCompetitions(
        @Query('isCreatedAfter') isAfter?: string,
        @Query('limit') limit?: string,
        @Query('source') source?: string,
        @Query('keyword') keyword?: string,
    ): Promise<Array<Omit<Competition, 'normalizedTitle'>>> {
        const where: Prisma.CompetitionWhereInput = {};
        if (source) {
            where.source = source;
        }
        if (keyword) {
            where.title = { contains: keyword };
        }
        const data = await this.competitionService.competitions({
            skip: isAfter ? Number(isAfter) : undefined,
            take: limit ? Number(limit) : undefined,
            where,
            orderBy: { createdAt: 'desc' },
        });
        return data.map(({ normalizedTitle, ...rest }) => rest);
    }

    @Get(':id')
    async getCompetition(
        @Param('id') id: string,
    ): Promise<Omit<Competition, 'normalizedTitle'>> {
        const data = await this.competitionService.competition({ id });
        if (!data) {
            throw new NotFoundException('Competition not found');
        }
        const { normalizedTitle, ...result } = data;
        return result;
    }
}
