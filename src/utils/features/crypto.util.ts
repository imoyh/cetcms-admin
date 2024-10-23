import { Injectable } from '@nestjs/common';
import md5 from 'crypto-js/md5';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoUtil {
  static md5(str: string): string {
    return md5(str).toString();
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 16);
  }

  static checkPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  hashPassword(password: string): string {
    return CryptoUtil.hashPassword(password);
  }

  checkPassword(password: string, hashedPassword: string): boolean {
    return CryptoUtil.checkPassword(password, hashedPassword);
  }

  md5(str: string): string {
    return CryptoUtil.md5(str);
  }
}
