import Client from "@connected/client";
export function hostFunction(...args) {
  return Client.execute("hostFunction", args);
}
Object.defineProperty(hostFunction, "meta", {
  value: {
    name: "hostFunction"
  }
});
