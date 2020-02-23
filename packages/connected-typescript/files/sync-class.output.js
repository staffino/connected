import { Client } from "@connected/client";
export class ExportedClass {
    constructor(...args) {
        this.constructorParameters = args;
    }
    classNamedMethod(...args) {
        return Client.execute("ExportedClass.classNamedMethod", args, this?.constructorParameters);
    }
}
export default class ExportedDefaultClass {
    constructor(...args) {
        this.constructorParameters = args;
    }
    doAnything(...args) {
        return Client.execute("ExportedDefaultClass.doAnything", args, this?.constructorParameters);
    }
}
