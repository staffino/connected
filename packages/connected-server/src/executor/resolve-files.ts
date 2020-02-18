import glob, { IOptions } from 'glob';

export default function resolveFiles(pattern: string, options: IOptions): Promise<string[]> {
  return new Promise((resolve, reject) =>
    glob(pattern, options, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    }));
}

export type ResolveFiles = typeof resolveFiles;
