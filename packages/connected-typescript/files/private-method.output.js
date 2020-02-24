import Client from "@connected/client";
import autoBind from "@connected/auto-bind";
export class PrivateMethod {
    constructor(...args) {
        this.constructorParameters = args;
        autoBind(this);
    }
}
