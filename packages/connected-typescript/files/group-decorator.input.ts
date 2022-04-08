// @ts-ignore
import { group } from '@connected/decorators';
export class Named {
  // @ts-ignore
  @group('gf1') f1() {
    return 1;
  }

  // @ts-ignore
  @group('gf2') async f2() {
    return 2;
  }
}
