import Client from "@connected/client";
export class ExportedClass {
    constructorParameters;
    constructor(...constructorParameters) {
        this.constructorParameters = constructorParameters;
    }
    classNamedMethod(...args) {
        return Client.execute("ExportedClass.classNamedMethod", args, this?.constructorParameters);
    }
}
export default class ExportedDefaultClass {
    constructorParameters;
    constructor(...constructorParameters) {
        this.constructorParameters = constructorParameters;
    }
    doAnything(...args) {
        return Client.execute("ExportedDefaultClass.doAnything", args, this?.constructorParameters);
    }
}
