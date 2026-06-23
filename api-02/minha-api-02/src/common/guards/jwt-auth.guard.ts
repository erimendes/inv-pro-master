import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Aqui ele chama a estratégia JWT padrão do Passport para validar o token
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Se o token for inválido, expirado ou não enviado, barra com 401 Unauthorized
    if (err || !user) {
      throw err || new UnauthorizedException('Acesso negado: Token inválido ou não fornecido');
    }
    
    // Se o token for válido, ele injeta o usuário no 'req.user'
    return user;
  }
}