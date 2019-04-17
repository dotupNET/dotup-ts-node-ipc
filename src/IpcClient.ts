import { EventEmitter } from 'events';
import { connect, Socket } from 'net';
import os from 'os';
import path from 'path';
// tslint:disable-next-line: no-submodule-imports
import { NodeStringDecoder, StringDecoder } from 'string_decoder';

const delimiter = String.fromCharCode(0x2); // '\\x';

export class IpcClient extends EventEmitter {
  private readonly enc: NodeStringDecoder;
  readonly sharedPath: string | number;
  readonly name: string;
  socket: Socket;
  reconnectTimer: NodeJS.Timeout;

  constructor(sharedPath: string, name: string);
  // tslint:disable-next-line: unified-signatures
  constructor(port: number, name: string);
  constructor(sharedPath: string | number, name: string) {
    super();
    if (typeof sharedPath === 'string') {
      this.sharedPath = this.getPipeName(sharedPath);
    } else {
      this.sharedPath = sharedPath;
    }

    this.name = name;
    this.enc = new StringDecoder('utf8');
  }

  start(): void {
    if (this.socket !== undefined) {
      return;
    }

    if (typeof this.sharedPath === 'string') {
      this.socket = connect(this.sharedPath);
    } else {
      this.socket = connect(this.sharedPath);
    }

    this.socket.on('close', hadError => {
      this.reconnect();
      this.emit('close', hadError);
    });

    this.socket.on('connect', () => this.emit('connect'));

    this.socket.on('error', (e) => {
      // const error = new IpcError(this.name, this.socket, `${this.name}: ${e}`);
      this.emit('error', e);
    });

    this.socket.on('data', (data) => {
      const messages = this.enc
        .end(data)
        .split(delimiter)
        .filter(x => x !== '');

      messages.forEach(m => {
        this.emit('data', m);
      });
    });

  }

  reconnect(): void {
    if (this.socket === undefined) {
      return;
    }

    this.reconnectTimer = setTimeout(
      () => {
        if (this.socket !== undefined && !this.socket.connecting) {
          this.socket.removeAllListeners();
          this.socket.destroy();
          this.socket = undefined;
          this.start();
        }
      },
      2000
    );
  }

  send(data: string | object) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    // if (this.socket !== undefined) {
    this.socket.write(`${message}${delimiter}`);
    // }
  }

  stop(): void {
    // Stop reconnecting
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer.unref();
      this.reconnectTimer = undefined;
    }

    if (this.socket !== undefined) {
      this.socket.removeAllListeners();
      this.socket.destroy();
      this.socket = undefined;
    }

  }

  getPipeName(pipeName: string): string {
    if (os.platform() === 'win32') {
      return path.join('\\\\?\\pipe', pipeName);
      // return `\\\\.\\pipe\\${pipeName}`;
    } else {
      return pipeName;
    }
  }

  on(event: 'close', listener: (had_error: boolean) => void): this;
  on(event: 'connect' | 'end', listener: () => void): this;
  on(event: 'data', listener: (data: string) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  // tslint:disable-next-line: no-any
  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);

    return this;
  }

}
