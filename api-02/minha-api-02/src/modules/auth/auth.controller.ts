import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
  ) {}

  // ==========================
  // REGISTER
  // ==========================
  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
  ) {
    return this.auth.register(dto);
  }

  // ==========================
  // LOGIN
  // ==========================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: any,
  ) {
    return this.auth.login(body, {
      ip: req.ip,
      userAgent:
        req.headers['user-agent'],
    });
  }

  // ==========================
  // REFRESH
  // ==========================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: RefreshTokenDto,
  ) {
    return this.auth.refresh(
      body.refreshToken,
    );
  }

  // ==========================
  // LOGOUT
  // ==========================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary:
      'Logout da sessão atual',
  })
  async logout(@Req() req: any) {
    return this.auth.logout(
      req.user.sessionId,
    );
  }

  // ==========================
  // LOGOUT ALL
  // ==========================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiOperation({
    summary:
      'Logout de todos dispositivos',
  })
  async logoutAll(@Req() req: any) {
    return this.auth.logoutAll(
      req.user.sub,
    );
  }
}