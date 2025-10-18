import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CompetitionService } from './modules/competitions/competition.service';
import { CompetitionsController } from './modules/competitions/competitions.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [CompetitionsController],
  providers: [AppService, PrismaService, CompetitionService],
})
export class AppModule {}
