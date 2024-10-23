import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class TokenFactory {
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload: JwtPayload, secret?: string, expiresIn?: string) {
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
    return { token, expiresIn };
  }

  verifyToken(token: string, secret?: string): any {
    return this.jwtService.verify(token, {
      secret,
    });
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}

// This factory class is used to create and verify JWT tokens.
