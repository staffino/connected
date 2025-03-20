export default async function importModule(file: string) {
  return import(file);
}

export type ImportModule = typeof importModule;
