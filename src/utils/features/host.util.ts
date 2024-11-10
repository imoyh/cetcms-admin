import * as os from 'os';

import { Injectable } from '@nestjs/common';

@Injectable()
export class HostUtil {
  static getIpAddress(): string {
    const interfaces = os.networkInterfaces();
    let ipAddress = '';

    for (const interfaceName in interfaces) {
      const addresses = interfaces[interfaceName];

      for (const address of addresses) {
        // 过滤出 IPv4 地址且不是回环地址
        if (address.family === 'IPv4' && !address.internal) {
          ipAddress = address.address;
          break; // 找到第一个局域网IP后结束循环
        }
      }

      if (ipAddress) break; // 如果已经找到IP地址，退出外循环
    }

    return ipAddress;
  }

  getIpAddress(): string {
    return HostUtil.getIpAddress();
  }
}
