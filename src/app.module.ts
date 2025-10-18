import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { CompetitionModule } from './modules/competitions/competition.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CompetitionModule,
        PrismaModule,
        ScraperModule,
    ],
    providers: [AppService],
})
export class AppModule {}
