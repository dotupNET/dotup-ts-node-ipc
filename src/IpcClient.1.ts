// tslint: disable
// import { connect, Socket } from 'net';
// import os from 'os';
// import path from 'path';
// import { Observable, Observer, Subject, Subscription, empty } from 'rxjs';
// // tslint:disable-next-line: no-submodule-imports
// import { switchMap, catchError } from 'rxjs/operators';
// import { NodeStringDecoder, StringDecoder } from 'string_decoder';
// import { IpcError } from './IpcError';

// const delimiter = 0x2; // '\\x';

// export class IpcClient {
//   private readonly subjectBus: Subject<string>;
//   private readonly enc: NodeStringDecoder;
//   readonly sharedPath: string | number;
//   readonly name: string;
//   socket: Socket;
//   reconnectTimer: NodeJS.Timeout;

//   constructor(sharedPath: string, name: string);
//   // tslint:disable-next-line: unified-signatures
//   constructor(port: number, name: string);
//   constructor(sharedPath: string | number, name: string) {
//     if (typeof sharedPath === 'string') {
//       this.sharedPath = this.getPipeName(sharedPath);
//     } else {
//       this.sharedPath = sharedPath;
//     }

//     this.name = name;
//     this.enc = new StringDecoder('utf8');
//     this.subjectBus = new Subject<string>();
//   }

//   subscribe(observer: Observer<string>): Subscription;
//   // tslint:disable-next-line: unified-signatures
//   subscribe(next: (value: string) => void): Subscription;
//   subscribe(o: Observer<string> | ((value: string) => void)): Subscription {
//     if (typeof o === 'function') {
//       return this.subjectBus.subscribe(o);
//     } else {
//       return this.subjectBus.subscribe(o);
//     }
//   }

//   start(): void {
//     if (this.socket !== undefined) {
//       return;
//     }

//     const dele = String.fromCharCode(delimiter);
//     if (typeof this.sharedPath === 'string') {
//       this.socket = connect(this.sharedPath);
//     } else {
//       this.socket = connect(this.sharedPath);
//     }

//     this.socket.on('close', () => {
//       this.reconnect();
//     });

//     this.socket.on('data', (data) => {
//       const messages = this.enc
//         .end(data)
//         .split(dele)
//         .filter(x => x !== '');

//       messages.forEach(m => {
//         this.subjectBus.next(m);
//       });
//     });

//     this.socket.on('error', (e) => {
//       const error = new IpcError(this.name, this.socket, `${this.name}: ${e}`);
//       this.subjectBus.error(error);
//     });

//   }

//   reconnect(): void {
//     if (this.socket === undefined) {
//       return;
//     }

//     this.reconnectTimer = setTimeout(
//       () => {
//         if (this.socket !== undefined && !this.socket.connecting) {
//           this.socket.removeAllListeners();
//           this.socket.destroy();
//           this.socket = undefined;
//           this.start();
//         }
//       },
//       2000
//     );
//   }

//   send(data: string) {
//     // if (this.socket !== undefined) {
//     this.socket.write(`${data}${delimiter}`);
//     // }
//   }

//   stop(): void {
//     // Stop reconnecting
//     if (this.reconnectTimer !== undefined) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer.unref();
//       this.reconnectTimer = undefined;
//     }

//     if (this.socket !== undefined) {
//       this.socket.removeAllListeners();
//       this.socket.destroy();
//       this.socket = undefined;
//     }

//     this.subjectBus.complete();
//     // this.subjectBus.complete();
//   }

//   getPipeName(pipeName: string): string {
//     if (os.platform() === 'win32') {
//       return path.join('\\\\?\\pipe', pipeName);
//       // return `\\\\.\\pipe\\${pipeName}`;
//     } else {
//       return pipeName;
//     }
//   }

//   asObservable(): Observable<string> {
//     return this.subjectBus.asObservable();
//   }

// }
