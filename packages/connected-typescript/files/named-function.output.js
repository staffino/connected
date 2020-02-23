import { Client } from "@connected/client";
export function namedFunction(...args) {
    return Client.execute("namedFunction", args);
}
Object.defineProperty(namedFunction, "meta", { value: { name: "namedFunction" } });
