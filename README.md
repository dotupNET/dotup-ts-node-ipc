# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

# dotup-ts-node-ipc

## Description

Node IPC communication over files

## sample

```typescript
import { IpcClient } from './IpcClient';
import { IpcServer } from './IpcServer';

const channelName = 'test-channel';

class Sample {

  start(): void {

    const ipcServer = new IpcServer(channelName);
    ipcServer.start();
    ipcServer.send('server-a');

    try {
      // Fails
      const addrInUseServer = new IpcServer(channelName);
      addrInUseServer.start();
      addrInUseServer.send('server-failes');
    } catch (error) {
      console.log(error);
    }

    let client3 = this.connect('3');

    const client2 = this.connect('2');

    const client1 = this.connect('1');

    // Client 2 sends each second data
    setInterval(
      () => {
        client2.send('send from c');
      },
      1000
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
      },
      20000
    );

  }

  // Creates a ipc client
  connect(name: string): IpcClient {
    const client = new IpcClient(channelName, `client ${name}`);

    client.subscribe(
      n => console.log(`${name}- ${n}`),
      e => console.log(e),
      () => console.log(`${name}-done`)
    );

    client.start();

    return client;
  }

}

const sample = new Sample();
sample.start();

```

## Release Notes
### 0.1.0

Fixes/Features:
- Initial release

## License

MIT © [Peter Ullrich](https://github.com/dotupNET/)

**Enjoy!**

[npm-image]: https://badge.fury.io/js/dotup-ts-node-ipc.svg
[npm-url]: https://npmjs.org/package/dotup-ts-node-ipc
[travis-image]: https://travis-ci.org/dotupNET/dotup-ts-node-ipc.svg?branch=master
[travis-url]: https://travis-ci.org/dotupNET/dotup-ts-node-ipc
[daviddm-image]: https://david-dm.org/dotupNET/dotup-ts-node-ipc.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/dotupNET/dotup-ts-node-ipc
[coveralls-image]: https://coveralls.io/repos/dotupNET/dotup-ts-node-ipc/badge.svg
[coveralls-url]: https://coveralls.io/r/dotupNET/dotup-ts-node-ipc
