import Client from "@connected/client";
export default function defaultFunction(...args) {
  return Client.execute("defaultFunction", args);
}
Object.defineProperty(defaultFunction, "meta", {
  value: {
    name: "defaultFunction"
  }
});
