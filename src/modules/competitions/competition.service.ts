import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Competition, Prisma } from 'generated/prisma';

@Injectable()
export class CompetitionService {
    constructor(private prisma: PrismaService) {}

    async competition(
        competitionWhereUniqueInput: Prisma.CompetitionWhereUniqueInput,
    ): Promise<Competition | null> {
        return this.prisma.competition.findUnique({
            where: competitionWhereUniqueInput,
        });
    }

    async competitions(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CompetitionWhereUniqueInput;
        where?: Prisma.CompetitionWhereInput;
        orderBy?: Prisma.CompetitionOrderByWithRelationInput;
    }): Promise<Competition[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.competition.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }
}
