import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    let count = 0;
    [0, 0].map((i) => {
      count += i;
    });
    console.log(count);
    return 'Hello World! v2 : ' + count;
  }
}
