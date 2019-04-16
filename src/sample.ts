import { IpcClient } from './IpcClient';
import { IpcServer } from './IpcServer';

const channelName = 6009; // 'test-channel';

class Sample {

  start(): void {

    const ipcServer = new IpcServer(channelName);
    ipcServer.start();
    ipcServer.send('server-a');

    // try {
    //   // Fails
    //   const addrInUseServer = new IpcServer(channelName);
    //   addrInUseServer.start();
    //   addrInUseServer.send('server-failes');
    // } catch (error) {
    //   console.log(error);
    // }

    let client3 = this.connect('3');

    const client2 = this.connect('2');

    const client1 = this.connect('1');

    // Client 2 sends each second data
    setInterval(
      () => {
        try {
          client1.send('send from 1');
          client2.send('send from 2');
          client3.send('send from 3');

        } catch (error) {
          console.error(error);
                    
        }
      },
      100
    );

    // Stop client 3 after some seconds and restart later
    setTimeout(

      () => {

        client3.stop();

        setTimeout(
          () => {
            client3 = this.connect('3');
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

    client.on('data', data => console.log(`${name}- ${data}`));

    client.on('error', e => {
      console.error(`${name}- ${e}`);
    });

    client.start();

    return client;
  }

}

const sample = new Sample();
sample.start();