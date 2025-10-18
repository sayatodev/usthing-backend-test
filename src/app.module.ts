import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { CompetitionModule } from './modules/competitions/competition.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CompetitionModule,
        PrismaModule,
        ScraperModule,
        ThrottlerModule.forRoot([
            {
                ttl: 0,
                limit: 0,
            },
        ]),
    ],
    providers: [AppService],
})
export class AppModule {}
