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

    async createCompetition(
        data: Prisma.CompetitionCreateInput,
    ): Promise<Competition> {
        return this.prisma.competition.create({
            data,
        });
    }

    async updateCompetition(params: {
        where: Prisma.CompetitionWhereUniqueInput;
        data: Prisma.CompetitionUpdateInput;
    }): Promise<Competition> {
        const { where, data } = params;
        return this.prisma.competition.update({
            data,
            where,
        });
    }

    async deleteCompetition(
        where: Prisma.CompetitionWhereUniqueInput,
    ): Promise<Competition> {
        return this.prisma.competition.delete({
            where,
        });
    }
}
