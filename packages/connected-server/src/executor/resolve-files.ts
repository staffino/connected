import glob, { IOptions } from 'glob';
import * as path from 'path';

export default function resolveFiles(pattern: string, options: IOptions): Promise<string[]> {
  return new Promise((resolve, reject) =>
    glob(pattern, options, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches.map(match => path.join(options.root!, match)));
      }
    }));
}

export type ResolveFiles = typeof resolveFiles;
