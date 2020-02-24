import Client from "@connected/client";
import autoBind from "@connected/auto-bind";
export class StaticMethod {
    constructor(...args) {
        this.constructorParameters = args;
        autoBind(this);
    }
}
