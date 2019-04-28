import fs from 'fs';
import os from 'os';
import path from 'path';

export namespace PipeName {

  export function unlinkSharedPath(sharedPath: string | number): void {
    if (typeof sharedPath === 'string') {
      if (fs.existsSync(sharedPath)) {
        fs.unlinkSync(sharedPath)
      }
    }
  }

  export function getPipeName(sharedPath: string | number): string | number {

    const port = Number(sharedPath);
    if (Number.isNaN(port)) {
      const pipeName = sharedPath.toString();

      // Path
      if (os.platform() === 'win32') {
        return path.join('\\\\?\\pipe', pipeName);
      } else {
        if (path.isAbsolute(pipeName)) {
          return pipeName;
        } else {
          return path.join(os.tmpdir(), pipeName);
        }
      }
    } else {
      // TCP Port
      return sharedPath;
    }
  }

}