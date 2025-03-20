export default function requireFile(file: string): object | Function {
  return require(file);
}

export type RequireFile = typeof requireFile;
