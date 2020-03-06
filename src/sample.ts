import { IpcClient } from "./IpcClient";
import { IpcServer } from "./IpcServer";

const channelName = "test-channel";

export class ScanMessage {
  id: string;
  transponderCode: string;
  timestamp: string;
  raceGroupId: number;

}

class Sample {

  start(): void {

    const ipcServer = new IpcServer(channelName);
    ipcServer.start();
    // ipcServer.send('server-a');

    // Fails
    const addrInUseServer = new IpcServer(channelName);
    addrInUseServer.start();
    addrInUseServer.on("error", e => console.log(e));
    // addrInUseServer.send('server-failes');

    const bigData: ScanMessage[] = [];

    for (let index = 0; index < 100; index += 1) {
      bigData.push({
        id: index.toString(),
        raceGroupId: index,
        timestamp: new Date().toISOString(),
        transponderCode: index.toString()
      });

    }

    let client3 = this.connect("3");

    const client2 = this.connect("2");

    const client1 = this.connect("1");

    // Client 2 sends each second data
    setInterval(
      () => {
        try {
          // client1.send(bigData);
          client1.send("send from 1");
          client2.send("send from 2");
          client3.send("send from 3");

        } catch (error) {
          console.error(error);

        }
      },
      2200
    );

    // Stop client 3 after some seconds and restart later
    setTimeout(

      () => {

        client3.stop();

        setTimeout(
          () => {
            client3 = this.connect("3");
          },
          6000
        );

      },
      3000

    );

    // Stop server after 20 sec
    setTimeout(
      () => {
        ipcServer.stop();
        setTimeout(() => { ipcServer.start(); }, 10000);
      },
      10000
    );

  }

  // Creates an observable ipc client
  connect(name: string): IpcClient {
    const client = new IpcClient(channelName, `client ${name}`);

    client.on("data", data => console.log(`${name}- ${data}`));

    client.on("error", e => {
      console.error(`${name}- ${e}`);
    });

    client.start();

    return client;
  }

}

const sample = new Sample();
sample.start();
