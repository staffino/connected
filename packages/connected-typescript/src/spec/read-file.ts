import * as fs from 'fs';

export default async function readFile(file: string): Promise<string> {
  return new Promise((resolve, reject) =>
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    })
  );
}
