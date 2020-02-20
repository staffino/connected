# `@connected/auto-bind`

This package automatically binds instance methods to itself.
It also preserves meta property of such instance method.  

## Usage

```
import autoBind from '@connected/auto-bind';

class A {        
  x = 3.14;
  constructor() {
    autoBind(this);
  }                
  m1() { return this.x }
}

const a = new A;
a.m1() === 3.14 // true
```
