import { createServer, Server, Socket } from 'net';
import os from 'os';
import path from 'path';

export class IpcServer {
  readonly sharedPath: string;
  private server: Server;
  private sockets: Socket[] = [];

  constructor(sharedPath: string) {
    this.sharedPath = this.getPipeName(sharedPath);
  }

  start(): void {

    if (this.server !== undefined) {
      console.log('Server already running');

      return;
    }

    this.server = createServer(socket => {
      this.sockets.push(socket);

      // socket.on('end', () => {
      // });

      socket.on('close', l => {
        this.sockets = this.sockets.filter(s => s.destroyed === false);
      });

      socket.on('data', (data) => {
        this.send(data);
      });

    });

    this.server.listen(
      this.sharedPath,
      () => {
        console.log(`listning on ${this.sharedPath}`);
      }
    );

    this.server.on('error', (e) => {
      // tslint:disable-next-line: no-any
      if ((<any>e).code === 'EADDRINUSE') {
        console.log(`path ${this.sharedPath} in use.`);

        return;
      }

      console.error(e);

      setTimeout(
        () => {
          if (this.server !== undefined) {
            this.server.close();
            this.server.listen(this.sharedPath);
          }
        },
        2000
      );

    });

  }

  send(data: Buffer | Uint8Array | string) {
    this.sockets.forEach(s => {
      if (!s.destroyed) {
        s.write(data);
      }
    });
  }

  stop(): void {
    if (this.server === undefined) {
      return;
    }
    this.sockets.forEach(s => s.destroy());
    this.sockets = [];
    this.server.close();
    this.server = undefined;
  }

  getPipeName(pipeName: string): string {
    if (os.platform() === 'win32') {
      return path.join('\\\\?\\pipe', pipeName);
    } else {
      return pipeName;
    }
  }

}
