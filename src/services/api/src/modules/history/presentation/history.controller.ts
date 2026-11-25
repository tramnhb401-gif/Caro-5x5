import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../../auth/application/auth.guard';
import { HistoryService } from '../application/history.service';
import type { CreateMatchHistoryInput } from '../application/history.service';

interface AuthenticatedRequest extends Request {
  userId: string;
}

@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.historyService.list(request.userId);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateMatchHistoryInput,
  ) {
    return this.historyService.create(request.userId, body);
  }

  @Delete()
  clear(@Req() request: AuthenticatedRequest) {
    return this.historyService.clear(request.userId);
  }
}
