import { Module } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [CompetitionsController],
    providers: [CompetitionService, PrismaService],
})
export class CompetitionModule {}
