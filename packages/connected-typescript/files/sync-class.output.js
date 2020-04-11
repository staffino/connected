import Client from "@connected/client";
import autoBind from "@connected/auto-bind";
export class ExportedClass {
    constructor(...args) {
        this.constructorParameters = args;
        autoBind(this);
    }
    classNamedMethod(...args) {
        return Client.execute("ExportedClass.classNamedMethod", args, this?.constructorParameters);
    }
}
Object.defineProperty(ExportedClass.prototype.classNamedMethod, "meta", { value: { name: "ExportedClass.classNamedMethod" } });
export default class ExportedDefaultClass {
    constructor(...args) {
        this.constructorParameters = args;
        autoBind(this);
    }
    doAnything(...args) {
        return Client.execute("ExportedDefaultClass.doAnything", args, this?.constructorParameters);
    }
}
Object.defineProperty(ExportedDefaultClass.prototype.doAnything, "meta", { value: { name: "ExportedDefaultClass.doAnything" } });
export function namedFunction(...args) {
    return Client.execute("namedFunction", args);
}
Object.defineProperty(namedFunction, "meta", { value: { name: "namedFunction" } });
