import fs from 'fs';
import path from 'path';

const { root } = path.parse(process.cwd());

export default function resolveRoot(dir: string): Promise<string> {
  if (dir === root) {
    return Promise.resolve('');
  }
  return new Promise((resolve) =>
    fs.access(path.join(dir, 'package.json'), fs.constants.F_OK, (err) => {
      resolve(err ? resolveRoot(path.basename(dir)) : dir);
    })
  );
}

export type ResolveRoot = typeof resolveRoot;
