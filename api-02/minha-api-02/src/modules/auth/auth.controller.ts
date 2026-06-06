// src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Interface genérica para capturar propriedades do Request do HTTP de forma limpa
interface CustomHttpRequest {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
  user?: {
    sub: string;
    sessionId: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  async register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e gerar tokens' })
  async login(
    @Body() body: LoginDto,
    @Req() req: CustomHttpRequest,
  ) {
    return this.auth.login(body, {
      ip: req.ip,
      // Usamos req.headers['user-agent'] já que não estamos injetando o Express puro
      userAgent: String(req.headers['user-agent'] || ''),
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token através do refresh token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout da sessão atual' })
  async logout(@Req() req: CustomHttpRequest & { user: { sessionId: string } }) {
    return this.auth.logout(req.user.sessionId);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout de todos dispositivos' })
  async logoutAll(@Req() req: CustomHttpRequest & { user: { sub: string } }) {
    return this.auth.logoutAll(req.user.sub);
  }
}