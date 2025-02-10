import Client from "@connected/client";
export class Named {
    constructorParameters;
    constructor(...args) {
        this.constructorParameters = args;
    }
    f1(...args) {
        return Client.execute("Named.f1", args, this?.constructorParameters, "gf1");
    }
    f2(...args) {
        return Client.execute("Named.f2", args, this?.constructorParameters, "gf2");
    }
}
Object.defineProperty(Named.prototype.f1, "meta", { value: { name: "Named.f1", group: "gf1" } });
Object.defineProperty(Named.prototype.f2, "meta", { value: { name: "Named.f2", group: "gf2" } });
