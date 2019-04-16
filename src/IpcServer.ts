import { createServer, Server, Socket } from 'net';
import os from 'os';
import path from 'path';
import { clearTimeout } from 'timers';

export class IpcServer {
  readonly sharedPath: string | number;
  private server: Server;
  private sockets: Socket[] = [];
  private reconnectTimer: NodeJS.Timeout;

  constructor(sharedPath: string);
  // tslint:disable-next-line: unified-signatures
  constructor(port: number);
  constructor(sharedPath: string | number) {
    if (typeof sharedPath === 'string') {
      this.sharedPath = this.getPipeName(sharedPath);
    } else {
      this.sharedPath = sharedPath;
    }
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
      socket.on('error', e => {
        console.error(e);
      });

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

      this.reconnectTimer = setTimeout(
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

    // Stop reconnecting
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
    }

    // Remove clients
    this.sockets.forEach(s => {
      s.removeAllListeners();
      s.destroy();
    });

    this.sockets = [];

    // Stop server
    if (this.server !== undefined) {
      this.server.removeAllListeners();
      this.server.close();
    }
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
