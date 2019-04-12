import { connect, Socket } from 'net';
import os from 'os';
import path from 'path';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { NodeStringDecoder, StringDecoder } from 'string_decoder';

const delimiter = '\\x';

export class IpcClient {
  private readonly subjectBus: Subject<string>;
  private readonly enc: NodeStringDecoder;
  readonly sharedPath: string;
  readonly name: string;
  socket: Socket;
  constructor(sharedPath: string, name: string) {
    this.name = name;
    this.sharedPath = this.getPipeName(sharedPath);
    this.enc = new StringDecoder('utf8');
    this.subjectBus = new Subject<string>();
  }

  subscribe(observer: Observer<string>): Subscription;
  subscribe(next: (value: string) => void, error?: (error: Error) => void, complete?: () => void): Subscription;
  subscribe(o: Observer<string> | ((value: string) => void), error?: null | undefined, complete?: () => void): Subscription {
    if (typeof o === 'function') {
      return this.subjectBus.subscribe(o, error, complete);
    } else {
      return this.subjectBus.subscribe(o);
    }
  }

  start(): void {
    this.socket = connect(this.sharedPath);

    this.socket.on('end', () => {
      console.log('end');
    });

    this.socket.on('data', (data) => {
      const messages = this.enc
        .end(data)
        .split(delimiter)
        .filter(x => x !== '');

      messages.forEach(m => {
        this.subjectBus.next(m);
      });
    });

    this.socket.on('error', (e) => {
      console.error(`${this.name}: ${e}`);

      this.subjectBus.error(e);

      setTimeout(
        () => {
          if (this.socket !== undefined) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.start();
          }
        },
        2000
      );

    });

  }

  send(data: string) {
    if (this.socket !== undefined) {
      this.socket.write(`${data}${delimiter}`);
    }
  }

  stop(): void {
    this.socket.destroy();
    this.socket = undefined;
    this.subjectBus.complete();
  }

  getPipeName(pipeName: string): string {
    if (os.platform() === 'win32') {
      return path.join('\\\\?\\pipe', pipeName);
      // return `\\\\.\\pipe\\${pipeName}`;
    } else {
      return pipeName;
    }
  }

  asObservable(): Observable<string> {
    return this.subjectBus.asObservable();
  }

}
