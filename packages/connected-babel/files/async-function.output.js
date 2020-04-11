import Client from "@connected/client";
export function asyncFunction(...args) {
  return Client.execute("asyncFunction", args);
}
Object.defineProperty(asyncFunction, "meta", {
  value: {
    name: "asyncFunction"
  }
});
