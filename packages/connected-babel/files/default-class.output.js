import Client from "@connected/client";
import autoBind from "@connected/auto-bind";
export default class Named {
  constructor(...args) {
    this.constructorParameters = args;
    autoBind(this);
  }

  f1(...args) {
    return Client.execute("Named.f1", args, this ? this.constructorParameters : null);
  }

  f2(...args) {
    return Client.execute("Named.f2", args, this ? this.constructorParameters : null);
  }

}
Object.defineProperty(Named.prototype.f1, "meta", {
  value: {
    name: "Named.f1"
  }
});
Object.defineProperty(Named.prototype.f2, "meta", {
  value: {
    name: "Named.f2"
  }
});
