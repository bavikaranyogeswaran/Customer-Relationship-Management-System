import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, LeadsModule, NotesModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
