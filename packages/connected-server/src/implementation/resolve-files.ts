import glob from 'glob';

export default function resolveFiles(root: string, pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    glob(pattern, { root }, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    }));
}

export type ResolveFiles = typeof resolveFiles;
