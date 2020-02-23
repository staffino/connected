import { Client } from "@connected/client";
import autoBind from "@connected/auto-bind";
export default class EventEmitterProvider {
    constructor(...args) {
        this.constructorParameters = args;
        autoBind(this);
    }
    invokeError(...args) {
        return Client.execute("EventEmitterProvider.invokeError", args, this?.constructorParameters);
    }
    notifyError(...args) {
        return Client.execute("EventEmitterProvider.notifyError", args, this?.constructorParameters);
    }
}
Object.defineProperty(EventEmitterProvider.prototype.invokeError, "meta", { value: { name: "EventEmitterProvider.invokeError" } });
Object.defineProperty(EventEmitterProvider.prototype.notifyError, "meta", { value: { name: "EventEmitterProvider.notifyError" } });
export function factory(...args) {
    return Client.execute("factory", args);
}
Object.defineProperty(factory, "meta", { value: { name: "factory" } });
