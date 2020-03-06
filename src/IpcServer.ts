import { EventEmitter } from "events";
import { getLogger } from "log4js";
import { createServer, Server, Socket } from "net";
import { StringDecoder } from "string_decoder";
import { clearTimeout } from "timers";
import { IpcServerMode } from "./IpcServerMode";
import { PipeName } from "./PipeName";

const delimiter = String.fromCharCode(0x2); // '\\x';
const logger = getLogger("IPC");

export class IpcServer extends EventEmitter {
  readonly sharedPath: string | number;
  readonly mode: IpcServerMode;
  private server: Server | undefined;
  private reconnectTimer: NodeJS.Timeout;
  private sockets: Socket[] = [];
  private readonly enc: StringDecoder;

  constructor(sharedPath: string, ipcServerMode?: IpcServerMode);
  // tslint:disable-next-line: unified-signatures
  constructor(port: number, ipcServerMode?: IpcServerMode);
  constructor(pathOrPort: string | number, ipcServerMode: IpcServerMode = IpcServerMode.distributor) {
    super();

    this.mode = ipcServerMode;
    this.sharedPath = PipeName.getPipeName(pathOrPort);

    logger.info(`Creating IPC Server ('${this.sharedPath}')`);

    if (this.mode === IpcServerMode.receiver) {
      this.enc = new StringDecoder("utf8");
    }
  }

  start(): void {

    if (this.server !== undefined) {
      console.log("Server already running");

      return;
    }

    logger.info(`Starting IPC Server ('${this.sharedPath}')`);

    this.server = createServer(socket => {
      this.sockets.push(socket);

      // socket.on('end', () => {
      // });
      socket.on("error", e => {
        logger.error(e);
        this.emit("error", e);
      });

      socket.on("close", l => {
        this.sockets = this.sockets.filter(s => s.destroyed === false);
      });

      socket.on("data", (data) => {
        if (this.mode === IpcServerMode.distributor) {
          this.send(data);
        } else {
          try {
            const messages = this.enc
              .end(data)
              .split(delimiter)
              .filter(x => x !== "");

            messages.forEach(m => {
              this.emit("data", m);
            });
          } catch (error) {
            logger.error(error);
            this.emit("error", error);
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

    this.server.on("error", (e) => {
      logger.error(e);
      if ((e as any).code === "EADDRINUSE") {
        this.emit("error", `path ${this.sharedPath} in use.`);
        this.stop();

        return;
      }

      this.reconnectTimer = setTimeout(
        () => {
          if (this.server !== undefined) {
            logger.warn(`Reconnecting IPC Server ('${this.sharedPath}')`);
            this.server?.close();
            this.server?.listen(this.sharedPath);
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
    this.sockets?.forEach(s => {
      s.removeAllListeners();
      s.destroy();
    });

    this.sockets = [];

    // Stop server
    this.server?.removeAllListeners();
    this.server?.close();
    this.server = undefined;

    logger.info(`IPC Server stopped ('${this.sharedPath}')`);

  }

}
