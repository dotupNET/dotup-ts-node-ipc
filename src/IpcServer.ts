import { EventEmitter } from 'events';
import { getLogger } from 'log4js';
import { createServer, Server, Socket } from 'net';
import os from 'os';
import path from 'path';
import { NodeStringDecoder, StringDecoder } from 'string_decoder';
import { clearTimeout } from 'timers';
import { IpcServerMode } from './IpcServerMode';

const delimiter = String.fromCharCode(0x2); // '\\x';
const logger = getLogger('IPC');

export class IpcServer extends EventEmitter {
  readonly sharedPath: string | number;
  readonly mode: IpcServerMode;
  private server: Server;
  private reconnectTimer: NodeJS.Timeout;
  private sockets: Socket[] = [];
  private readonly enc: NodeStringDecoder;

  constructor(sharedPath: string, ipcServerMode?: IpcServerMode);
  // tslint:disable-next-line: unified-signatures
  constructor(port: number, ipcServerMode?: IpcServerMode);
  constructor(sharedPath: string | number, ipcServerMode: IpcServerMode = IpcServerMode.distributor) {
    super();

    this.mode = ipcServerMode;
    const port = Number(sharedPath);
    if (Number.isNaN(port)) {
      this.sharedPath = this.getPipeName(sharedPath.toString());
    } else {
      this.sharedPath = sharedPath;
    }

    logger.info(`Creating IPC Server ('${this.sharedPath}')`);

    if (this.mode === IpcServerMode.receiver) {
      this.enc = new StringDecoder('utf8');
    }
  }

  start(): void {

    if (this.server !== undefined) {
      console.log('Server already running');

      return;
    }

    logger.info(`Starting IPC Server ('${this.sharedPath}')`);

    this.server = createServer(socket => {
      this.sockets.push(socket);

      // socket.on('end', () => {
      // });
      socket.on('error', e => {
        logger.error(e);
        this.emit('error', e);
      });

      socket.on('close', l => {
        this.sockets = this.sockets.filter(s => s.destroyed === false);
      });

      socket.on('data', (data) => {
        if (this.mode === IpcServerMode.distributor) {
          this.send(data);
        } else {
          try {
            const messages = this.enc
              .end(data)
              .split(delimiter)
              .filter(x => x !== '');

            messages.forEach(m => {
              this.emit('data', m);
            });
          } catch (error) {
            logger.error(error);
            this.emit('error', error);
          }
        }
      });

    });

    this.server.listen(
      this.sharedPath,
      () => {
        logger.info(`Listening on ${this.sharedPath}`);
      }
    );

    this.server.on('error', (e) => {
      // tslint:disable-next-line: no-any
      logger.error(e);
      // tslint:disable-next-line: no-any
      if ((<any>e).code === 'EADDRINUSE') {
        this.emit('error', `path ${this.sharedPath} in use.`);
        this.stop();

        return;
      }

      this.reconnectTimer = setTimeout(
        () => {
          if (this.server !== undefined) {
            logger.warn(`Reconnecting IPC Server ('${this.sharedPath}')`);
            this.server.close();
            this.server.listen(this.sharedPath);
          }
        },
        2000
      );

    });

  }

  private send(data: Buffer | Uint8Array | string) {
    this.sockets.forEach(s => {
      if (!s.destroyed) {
        s.write(data);
      }
    });
  }

  stop(): void {

    logger.info(`Stopping IPC Server ('${this.sharedPath}')`);

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

    logger.info(`IPC Server stopped ('${this.sharedPath}')`);

  }

  getPipeName(pipeName: string): string {
    if (os.platform() === 'win32') {
      return path.join('\\\\?\\pipe', pipeName);
    } else {
      return pipeName;
    }
  }

}
