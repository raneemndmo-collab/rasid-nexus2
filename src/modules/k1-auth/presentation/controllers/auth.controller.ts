import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Public } from '@shared/presentation/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService, USER_VALIDATOR, IUserValidator } from '../../application/services/auth.service';
import { LoginDto, ValidateTokenDto, TokenResponseDto, RefreshTokenDto } from '../../application/dtos/auth.dto';
import { Inject } from '@nestjs/common';

@ApiTags('Auth (K1)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(USER_VALIDATOR) private readonly userValidator: IUserValidator,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and issue JWT tokens' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<TokenResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(dto, ipAddress, userAgent, this.userValidator);
  }

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired' })
  async validate(@Body() dto: ValidateTokenDto) {
    const payload = await this.authService.validateToken(dto.token);
    return { valid: true, payload };
  }

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    const payload = await this.authService.validateToken(dto.refreshToken);
    // Re-issue tokens using the validated payload
    const loginDto: LoginDto = {
      email: payload.email,
      password: '', // Not needed for refresh
      tenantId: payload.tenantId,
    };
    // For refresh, we bypass password validation
    return {
      accessToken: '', // Will be implemented with proper refresh logic
      refreshToken: '',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  @Public()
  @Get('.well-known/jwks')
  @ApiOperation({ summary: 'Get JSON Web Key Set for token verification' })
  @ApiResponse({ status: 200, description: 'JWKS response' })
  getJwks() {
    return this.authService.getJwks();
  }
}
