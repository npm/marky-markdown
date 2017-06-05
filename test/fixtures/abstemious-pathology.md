
** At one point, we discovered that in a long enough document, a long enough
series of consecutive HTML blocks would cause a bazillion-fold increase in
execution time, essentially creating an infinite loop. Here's a copy of the
readme that revealed this **

# Primus

[![Version npm](https://img.shields.io/npm/v/happn-primus.svg?style=flat-square)](https://www.npmjs.com/package/happn-primus)[![Build Status](https://img.shields.io/travis/happner/primus/master.svg?style=flat-square)](https://travis-ci.org/happner/primus)[![Dependencies](https://img.shields.io/david/happner/primus.svg?style=flat-square)](https://david-dm.org/happner/primus)

Primus, the creator god of transformers but now also known as universal wrapper
for real-time frameworks. There are a lot of real-time frameworks available for
Node.js and they all have different opinions on how real-time should be done.
Primus provides a common low level interface to communicate in real-time using
various real-time frameworks.

### Advantages

1. Effortless switching between real-time frameworks by changing one single line
   of code. No more API rewrites needed when your project requirements change,
   the framework gets abandoned or simply breaks down.
2. Built-in reconnect, it just works. The reconnect is controlled by a
   randomised exponential back-off algorithm to reduce server stress.
3. Offline detection, Primus is smart enough to detect when users drop their
   internet connection (switching WIFI points/cell towers for example) and
   reconnects when they are back online.
4. Automatically encodes and decodes messages using custom parsers. Can be
   easily switched for binary encoding for example.
5. A clean, stream-compatible interface for the client and server. You can
   just `stream#pipe` data around. In addition to that, the client works on
   Node.js as well, write once, run it everywhere.
6. Fixes various of bugs in the supported frameworks and additional stability
   patches to improve real-time communication.
7. Comes with an amazing plugin interface to keep the core library as fast and
   lean as possible while still allowing the server and the client to be
   extended.
8. Last but not least, Primus is built with love, passion and dedication to the
   real-time web.

```
If you have questions or need help with primus, come chat in our IRC room:

   server: irc.freenode.net
   room: #primus
```

### Installation

Primus is released on `npm` and can be installed using:

```
npm install happn-primus --save
```

### Before Starting

If you deploy your application behind a reverse proxy (Nginx, HAProxy, etc.) you
might need to add WebSocket specific settings to its configuration files. If
you intend to use WebSockets, please ensure that these settings have been added.
There are some example configuration files available in the
[observing/balancerbattle](https://github.com/observing/balancerbattle)
repository.

### Table of Contents

- [Introduction](#primus)
  - [Advantages](#advantages)
- [Installation](#installation)
- [Getting started](#getting-started)
  - [Client library](#client-library)
- [Connecting from the browser](#connecting-from-the-browser)
- [Connecting from the server](#connecting-from-the-server)
- [Authorization](#authorization)
- [Broadcasting](#broadcasting)
- [Destruction](#destruction)
- [Events](#events)
- [Heartbeats and latency](#heartbeats-and-latency)
- [Supported real-time frameworks](#supported-real-time-frameworks)
  - [BrowserChannel](#browserchannel)
  - [Engine.IO](#engineio)
  - [Faye](#faye)
  - [lws](#lws)
  - [Socket.IO](#socketio)
  - [SockJS](#sockjs)
  - [WebSockets](#websockets)
- [Transformer inconsistencies](#transformer-inconsistencies)
- [Parsers](#parsers)
- [Middleware](#middleware)
- [Plugins](#plugins)
  - [Extending the Spark / Socket](#extending-the-spark--socket)
  - [Transforming and intercepting messages](#transforming-and-intercepting-messages)
  - [Primus project plugins](#primus-project-plugins)
  - [Community plugins](#community-plugins)
- [Community](#community)
- [FAQ](#FAQ)
  - [Scaling](#what-is-the-best-way-to-scale-primus)
  - [Cluster](#can-i-use-cluster)
  - [Express](#how-do-i-use-primus-with-express-3)
  - [RequireJS](#is-requirejs-supported)
  - [Custom headers](#can-i-send-custom-headers-to-the-server)
- [Versioning](#versioning)
  - [History](#history)
  - [Convention](#convention)
  - [Release cycle](#release-cycle)
- [Other languages](#other-languages)
  - [Protocol](#protocol)
- [License](#license)

### Getting started

Primus doesn't ship with real-time frameworks as dependencies, it assumes that
you as user add them yourself as a dependency. This is done to keep the module
as lightweight as possible. This works because `require` in will walk through
your directories searching for `node_module` folders that have these matching
dependencies.

Primus needs to be "attached" to a HTTP compatible server. These includes the
built-in `http` and `https` servers but also the `spdy` module as it has the
same API as node servers. Creating a new Primus instance is relatively
straightforward:

```js
'use strict';

var Primus = require('primus')
  , http = require('http');

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {/* options */});
```
The following options can be provided:

| Name                   | Description                              | Default                            |
| ---------------------- | ---------------------------------------- | ---------------------------------- |
| authorization          | Authorization handler                    | `null`                             |
| pathname               | The URL namespace that Primus can own    | `/primus`                          |
| parser                 | Message encoder for all communication    | `JSON`                             |
| transformer            | The transformer we should use internally | `websockets`                       |
| plugin                 | The plugins that should be applied       | `{}`                               |
| timeout                | The heartbeat timeout (__ignored, server learns timeout from client on connect__) | `35000`                            |
| allowSkippedHeartBeats | To allow waylaid pings                   | `2`                                |
| global                 | Set a custom client class / global name  | `Primus`                           |
| compression            | Use permessage-deflate / HTTP compression | `false`                            |
| origins                | **cors** List of origins                 | `*`                                |
| methods                | **cors** List of accepted HTTP methods   | `GET,HEAD,PUT,POST,DELETE,OPTIONS` |
| credentials            | **cors** Allow sending of credentials    | `true`                             |
| maxAge                 | **cors** Cache duration of CORS preflight | `30 days`                          |
| headers                | **cors** Allowed headers                 | `false`                            |
| exposed                | **cors** Headers exposed to the client   | `false`                            |
| pongSkipTime           | deduplicate songs                        | `1000ms`                           |

The options that are prefixed with **cors** are supplied to our
[access-control](https://github.com/primus/access-control) module which handles
HTTP Access Control (CORS), so for a more detailed explanation of these options
check it out.

The `heartbeat timeout` is used to disconnect the client if no ping arrives within that time. The timeout is not configurable, instead it is learned from the client's connect url. This allows the server to handle new client deployments with longer timeouts as well as older deployments with shorter/default timeouts. The connecting url includes the client's ping and pong values. It calculates an appropriate `heartbeat timeout` as `ping + (pong / 2)`. The division by 2 allows for the server to emit  pongs to the client sufficiently timeously to avert the waylaid ping conundrum as described below.

The waylaid ping conundrum occurs when the client sends a payload whose transmission time exceeds the heartbeat timeout at the server. Although the client sent the ping in time, its arrival at the server is delayed behind the large payload. So either the server closes the socket because no ping arrived in time or the client closes the socket because the server never replied with a pong in time.

To avert this problem the server can be configured to allow for the missing heartbeats/pings by setting the `allowSkippedHeartBeats` option sufficiently large to encompass the duration of the large payload's transmission, specifically, `allowSkippedHeartBeats` x `heartbeat timeout` should be long enough to transmit the payload.

That solves the problem of the server closing the socket for a limited number of missed pings.

To solve the problem of the client closing the socket the server sends a unsolicited pong to the client when the heartbeat is skipped. For this to work the pong needs to be sent before the client times out waiting for it. To achieve this the heatbeat timeout at the server (as calculated from the connect url with the formula above) exceeds the client's ping interval to prevent the sending of unnecessary pongs, but does not exceed the client's ping interval plus pong timeout so that the unsolicited pong does arrive at the client in time.

For already deplyed clients the pong timeout is 10000ms. This means that the defaulted `heartbeat timeout` at the server will cause the server to emit the unsolicited pong with only 5000ms client-bound transmission latency leeway before the client-side timeout closes the socket.

For new deployments the client's deafult pong timeout is increased to 20000ms. Allowing for a 10000ms latency.

If you don't have a pre-existing server where you want or can attach your Primus
server to you can also use the `Primus.createServer` convenience method. The
`createServer method will automatically:

- Setup a HTTP, HTTPS or SPDY server for you on the given port number.
- Setup your Primus server with the given configuration.
- Listen on the HTTP, HTTPS, SPDY server.
- Attach a `primus.on('connection')` listener.
- Return the created Primus instance.

```js
Primus.createServer(function connection(spark) {

}, { port: 8080, transformer: 'websockets' });
```

In the above example we automatically create a HTTP server which will listen
on port 8080, a primus instance with the `websockets` transformer and start
listening for incoming connections. The supplied function in the
`Primus.createServer` method is optional. You can just listen for incoming
connections your self using the returned Primus instance. If you want to listen to
a HTTPS or SPDY server, which is recommended, you can directly pass the SPDY and
HTTPS certs/keys/pfx files in the options object:

```js
var primus = Primus.createServer({
  port: 443,
  root: '/folder/with/https/cert/files',
  cert: 'myfilename.cert',
  key: 'myfilename.cert',
  ca: 'myfilename.ca',
  pfx: 'filename.pfx',
  passphrase: 'my super sweet password'
});

primus.on('connection', function (spark) {
  spark.write('hello connnection');
});
```

`Primus.createServer` returns a warning when it starts a HTTP server. The
warning advises you to use a HTTPS server and can be disabled setting the
option `iknowhttpsisbetter` to `true`.

#### Client library

As most libraries come with their own client-side framework for making the
connection we've also created a small wrapper for this. The library can be
retrieved using:

```js
primus.library();
```

Which returns the client-side library as a string (which can then be minified or
even have more code added to it). It does not come pre-minified as that is out
of the scope of this project. You can store this on a CDN or on your static server.
Do whatever you want with it, but remember to regenerate it every time you change
Primus server options. This is important because some properties of the client
are set using the server configuration. For example if you change the
`pathname`, the client should be regenerated to reflect that change and work
correctly. We advise you to regenerate the library every time you redeploy so
you always have a client compatible with your back-end. To save the file you
can use:

```js
primus.save(__dirname +'/primus.js');
```

This will store the compiled library in your current directory. If you want to
save it asynchronously, you can supply the method with a callback method:

```js
primus.save(__dirname +'/primus.js', function save(err) {

});
```

But to make it easier for you during development we've automatically added an
extra route to the supplied HTTP server, this will serve the library for you so
you don't have to save it. Please note, that this route isn't optimised for
serving static assets and should only be used during development. In your HTML
page add:

```html
<script src="/primus/primus.js"></script>
```

As you can see, it will use the `/primus` pathname by default. Primus needs to
own the whole path/namespace in order to function properly as it will forward
all other requests directly in to the transformers so they can work their magic.
If you already have a static folder with the name `primus` you can change the
pathname to something different and still make this work. But you would of
course need to update the `src` attribute of the script tag to set the correct
location. It's always available at:

```
<protocol>://<server location>/<pathname>/primus.js
```

Here `<pathname>` is the `pathname` set in server options above. The client
is cross domain compatible so you don't have to serve it from the
same domain you're running Primus on. But please note, that the real-time
framework you're using might be tied to same domain restrictions.

Once you're all set up you can start listening for connections. These
connections are announced through the `connection` event.

```js
primus.on('connection', function (spark) {
  // spark is the new connection.
});
```

Disconnects are announced using a `disconnection` event:

```js
primus.on('disconnection', function (spark) {
// the spark that disconnected
});
```

The `spark` argument is the actual real-time socket/connection. Sparks have a
really low level interface and only expose a couple properties that are cross
engine supported. The interface is modeled towards a Node.js stream compatible
interface. So this will include all methods that are available on the [stream
interface](https://nodejs.org/api/stream.html) including `Spark#pipe`.

#### spark.headers

The `spark.headers` property contains the headers of either the request
that started a handshake with the server or the headers of the actual real-time
connection. This depends on the module you are using.

*Please note that sending custom headers from the client to the server is
impossible as not all transports that these transformers support can add custom
headers to a request (JSONP for example). If you need to send custom data, use a
query string when connecting*

#### spark.address

The `spark.address` property contains the `ip` and `port` of the
connection. If you're running your server behind a reverse proxy it will
automatically use the `x-forwarded-for` header. This way you will always have
the address of the connecting client and not the IP address of your proxy.

*Please note that the `port` is probably out of date by the time you're going
to read it as it's retrieved from an old request, not the request that is
active at the time you access this property.*

#### spark.query

The `spark.query` contains the query string you used to connect to the server. It's
parsed as an object. Please note that this may not be available for all supported
transformers.

#### spark.id

This is a unique id that we use to identify this single connection with. Normally
the frameworks refer to this as a `sessionid`, which is confusing as it's only
used for the duration of one single connection. You should not see this as a
"session id", and rather expect it to change between disconnects and reconnects.

#### spark.request

The `spark.request` gives you access to the HTTP request that was used to
initiate the real-time connection with the server. Please note that this request
is already answered and closed (in most cases) so do not attempt to write or
answer it anyway. But it might be useful to access methods that get added by
middleware layers, etc.

#### spark.write(data)

You can use the `spark.write` method to send data over the socket. The data is
automatically encoded for you using the `parser` that you've set while creating
the Primus server instance. This method always returns `true` on success and
`false` on failure so back pressure isn't handled.

```js
spark.write({ foo: 'bar' });
```

#### spark.end(data, options)

You can use `spark.end` to close the connection. This method takes two optional
arguments. The first, if provided, is the `data` to send to the client before
closing the connection. The second is an options object used to customize the
behavior of the method. By default the `spark.end` method closes the connection
in a such way that the client knows it was intentional and it doesn't attempt a
reconnection.

```js
spark.end(); // the client doesn't reconnect automatically
```

You can change this behavior and trigger a client-side reconnection using the
`reconnect` option.

```js
spark.end(undefined, { reconnect: true }); // trigger a client-side reconnection
```

#### spark.emits(event, parser)

This method is mostly used internally. It works similarly to the native `bind`
function, returning a function that emits the assigned `event` every time it's
called. If the last argument is a function, it will be used to parse the
arguments of the returned function. The `parser` is optional and always async,
its **first** argument is a callback that follows the usual error first pattern,
all successive arguments are the ones to parse. Using the `parser` you can
reduce the arguments down to a single value, remove them completely or prevent
the event from being emitted. See [emits](https://github.com/primus/emits) for
detailed usage instructions.

```js
spark.emits('event', function parser(next, structure) {
  next(undefined, structure.data);
});
```

Please note that the data that is received here isn't decoded yet.

#### spark.on('data')

The `data` event is emitted when a message is received from the client. It's
automatically decoded by the specified decoder.

```js
spark.on('data', function message(data) {
  // the message we've received.
});
```

#### spark.on('end')

The `end` event is emitted when the client has disconnected.

```js
primus.on('connection', function (spark) {
  console.log('connection has the following headers', spark.headers);
  console.log('connection was made from', spark.address);
  console.log('connection id', spark.id);

  spark.on('data', function (data) {
    console.log('received data from the client', data);

    //
    // Always close the connection if we didn't receive our secret imaginary
    // handshake.
    //
    if ('foo' !== data.secrethandshake) spark.end();
    spark.write({ foo: 'bar' });
    spark.write('banana');
  });

  spark.write('Hello world');
})
```

### Connecting from the Browser

Primus comes with its client framework which can be compiled using
`primus.library()` as mentioned above. To create a connection you can simply
create a new Primus instance:

```js
var primus = new Primus(url, { options });

//
// But it can be easier, with some syntax sugar.
//
var primus = Primus.connect(url, { options });
```

The URL should confirm the following conditions:

- It should include the protocol it needs to connect with. This can either be
  `http` or `https`. We recommend that you're using HTTPS for all your
  connections as this prevents connection blocking by firewalls and anti-virus
  programs.
- The URL should not include a pathname. The pathname is configured by the
  server (See: [getting-started](#getting-started)) and needs to be configured
  there as it will be compiled in to the `primus.js` client file.

If no `url` argument is passed, it will default to the current URL.

The following options can be provided:

| Name        | Description                             | Default                       |
| ----------- | --------------------------------------- | ----------------------------- |
| [reconnect] | Configures the exponential back off     | `{}`                          |
| timeout     | Connect time out                        | `10000` ms                    |
| ping        | Ping interval to test connection        | `25000` ms (0 to disable)     |
| pong        | Time the server has to respond to ping  | `10000` ms                    |
| [strategy]  | Our reconnect strategies                | `"disconnect,online,timeout"` |
| manual      | Manually open the connection            | `false`                       |
| websockets  | Should we use WebSockets                | Boolean, is detected          |
| network     | Use native `online`/`offline` detection | Boolean, is feature detected  |
| transport   | Transport specific configuration        | `{}`                          |
| queueSize   | Number of messages that can be queued   | `Infinity`                    |

There are 2 important options that we're going to look a bit closer at.

##### Reconnect

When the connection goes down unexpectedly an automatic reconnect process is
started. It uses a randomised exponential back-off algorithm to prevent clients
from DDoSing your server when you reboot as they will all be re-connecting at
different times. The reconnection can be configured using the `options` argument
in `Primus` and you should add these options to the `reconnect` property:

| Name              | Description                              | Default    |
| ----------------- | ---------------------------------------- | ---------- |
| max               | Maximum delay for a reconnection attempt | `Infinity` |
| min               | Minimum delay for a reconnection attempt | `500` ms   |
| retries           | Maximum amount of attempts               | `10`       |
| reconnect timeout | Maximum time for an attempt to complete  | `30000` ms |
| factor            | Exponential back off factor              | `2`        |

```js
primus = Primus.connect(url, {
  reconnect: {
      max: Infinity // Number: The max delay before we try to reconnect.
    , min: 500 // Number: The minimum delay before we try reconnect.
    , retries: 10 // Number: How many times we should try to reconnect.
  }
});
```

When you're going to customize `min` please note that it will grow
exponentially e.g. `500 -> 1000 -> 2000 -> 4000 -> 8000` and is randomized
so expect to have slightly higher or lower values.

Please note that when we reconnect, we will receive a new `connection` event on
the server and a new `open` event on the client, as the previous connection was
completely dead and should therefore be considered a new connection.

If you are interested in learning more about the backoff algorithm you might
want to read http://dthain.blogspot.nl/2009/02/exponential-backoff-in-distributed.html

##### Strategy

The strategy allows you to configure when you want a `reconnect` operation to
kick in. We're providing some **sane** defaults for this but we still want to
provide users with highest level of customization:

<dl>
  <dt>disconnect</dt>
  <dd>
    Reconnect when we detect an unintentional disconnect in the connection.
  </dd>
  <dt>online</dt>
  <dd>
    Reconnect when the browser went from an offline event to an online event.
  </dd>
  <dt>timeout</dt>
  <dd>
    Reconnect when we failed to establish our initial connection. This can
    happen because we took too long to connect or because there was an error
    while we tried to connect (which happens when you connect to a dead server)
  </dd>
</dl>

You can supply these options as a comma-separated `String`:

```js
var primus = new Primus(url, { strategy: 'online, timeout, disconnect' })
```

Or as an `Array`:

```js
var primus = new Primus(url, { strategy: [ 'online', 'timeout', 'disconnect' ]});
```

We'll try to normalize everything as much as possible, we `toLowerCase` everything
and join it back to a readable string so if you wrote `dIsconNect` it will get
normalized to `disconnect`.

**If you are using authentication you should disable the `timeout` strategy as
there is no way of detecting the difference between a failed authorization and a
failed connect. If you leave this enabled with authorization every unauthorized
access will try to reconnect again**.

We automatically disable this for you when you've set the authorization before
you save the library.

But there are always use cases where reconnection is not advised for your
application. In these cases we've provided a way to completely disable the
reconnection, this is done by setting the `strategy` to `false`:

```js
var primus = new Primus(url, { strategy: false });
```
If you want to manually control the reconnection you can call `primus.end()`
to close the connection and `primus.open()` to establish a new one. **Be sure
to use `primus.open()` correctly, see below for details.**

[reconnect]: #reconnect
[strategy]: #strategy

##### transport

The transport object allows you to add a transport specific configuration.
We only recommend using this if you understand and accept the following
consequences:

- Primus will try to override configuration properties that are needed to
  ensure a correct functioning.
- We might start using options without any announcement or major version bump.
- Expect your client and its connection to malfunction once you switch between
  different transports, as these configurations are specific to the bundled
  transformer library/client.
- Bugs and bug reports caused by using this functionality are closed
  immediately.

Having that said, this gives you total freedom while still getting the benefits
of Primus.

#### primus.open()

This method opens a connection with the server. By default it is called
automatically when the Primus instance is created, but there are cases where
it's desirable to open the connection manually. To do this set the `manual`
option to `true` and when you have the Primus instance call the method:

```js
primus.open();
```

**When you call `primus.open()` you should make sure that the connection is
totally dead (e.g. after an `end` event) and primus isn't already trying or
planning to reconnect**.

#### primus.write(message)

Once you've created your Primus instance you're ready to go. When you want to
write data to your server you can just call the `.write` method:

```js
primus.write('message');
```

It automatically encodes your messages using the parser that you've specified on
the server. So sending objects back and forth between the server is nothing
different then just writing:

```js
primus.write({ foo: 'bar' });
```

When you are sending messages to the server, you don't have to wait for the
`open` event to happen, the client will automatically buffer all the data you've
send and automatically write it to the server once it's connected. The client
supports a couple of different events.

#### primus.on('data')

The `data` event is the most important event of the whole library. It's emitted
when we receive data from the server. The data that is received is already
decoded by the specified parser.

```js
primus.on('data', function message(data) {
  console.log('Received a new message from the server', data);
});
```

#### primus.on('open')

The `open` event is emitted when we've successfully created a connection with
the server. It will also be emitted when we've successfully reconnected after the
connection goes down unintentionally.

```js
primus.on('open', function open() {
  console.log('Connection is alive and kicking');
});
```

#### primus.on('error')

The `error` event is emitted when something breaks that is out of our control.
Unlike Node.js, we do not throw an error if no `error` event listener is
specified. In general, when there is an active connection, it is not directly
closed when an `error` event is emitted. The cause of an error, in fact, could
be that the parser failed to encode or decode a message. In this case we only
emit the error, discard the message and keep the connection alive. An `error`
event can also be emitted when a connection fails to establish. When this
happens the client automatically tries to reconnect, unless the connection gets
closed for some other reason. The only exception is when there is an
authorization hook. If we get an error when connecting to a server where
authorization is required, we simply close the connection, as we can't
determinate if the error is the result of an unauthorized access or not.

```js
primus.on('error', function error(err) {
  console.error('Something horrible has happened', err.stack);
});
```

#### primus.on('reconnect')

The `reconnect` event is emitted when we're attempting to reconnect to the
server. This all happens transparently and it's just a way for you to know when
these reconnects are actually happening.

```js
primus.on('reconnect', function (opts) {
  console.log('Reconnection attempt started');
});
```

#### primus.on('reconnect scheduled')

Looks a lot like the `reconnect` event mentioned above, but it's emitted when
we've detected that connection went/is down and we're going to start a reconnect
operation. This event would be ideal to update your application's UI when the
connection is down and you are trying to reconnect in x seconds.

```js
primus.on('reconnect scheduled', function (opts) {
  console.log('Reconnecting in %d ms', opts.scheduled);
  console.log('This is attempt %d out of %d', opts.attempt, opts.retries);
});
```

#### primus.on('reconnected')

The client successfully reconnected with the server.

```js
primus.on('reconnected', function (opts) {
  console.log('It took %d ms to reconnect', opts.duration);
});
```

#### primus.on('reconnect timeout')

The `reconnect timeout` event is emitted when a reconnection attempt takes too
much time. This can happen for example when the server does not answer a request
in a timely manner.

```js
primus.on('reconnect timeout', function (err, opts) {
  console.log('Timeout expired: %s', err.message);
});
```

After this event a whole new reconnection procedure is automatically started, so
you don't have to worry about it.

#### primus.on('reconnect failed')

This event is emitted when the reconnection failed, for example when all
attempts to reconnect have been unsuccessful.

```js
primus.on('reconnect failed', function (err, opts) {
  console.log('The reconnection failed: %s', err.message);
});
```

#### primus.on('end')

The `end` event is emitted when we've closed the connection. When this event is
emitted you should consider your connection to be fully dead with no way of
reconnecting. But it's also emitted when the server closes the connection.

```js
primus.on('end', function () {
  console.log('Connection closed');
});
```

#### primus.end()

When you want to close the connection you can call the `primus.end()` method.
After this the connection should be considered dead and a new connection needs
to be made using `Primus.connect(url)` or `primus = new Primus(url)` if you want
to talk with the server again.

```js
primus.end();
```

#### primus.destroy()

This method literally destroys the `primus` instance. Internally it calls the
`primus.end()` method but it also frees some potentially heavy objects like
the underlying socket, the timers, the message transformers, etc. It also
removes all the event listeners but before doing that it emits a final `destroy`
event. Keep in mind that once this method is executed, you can no longer use
`primus.open()` on the same `primus` instance.

```js
primus.on('destroy', function () {
  console.log('Feel the power of my lasers!');
});

primus.destroy();
```

#### primus.emits(event, parser)

This method is analogous to the [`spark.emits`](#sparkemitsevent-parser) method.
It returns a function that emits the given event every time it's called. See
[emits](https://github.com/primus/emits) for detailed usage instructions.

```js
primus.emits('event', function parser(next, structure) {
  next(undefined, structure.data);
});
```

#### primus.id(callback)

There are cases where it is necessary to retrieve the [`spark.id`](#sparkid)
from the client. To make this easier, we added a `primus.id()` method that
takes a callback function to which the id will be passed.

```js
primus.id(function (id) {
  console.log(id);
});
```

### Connecting from the server

The client-side library has been made compatible with Node.js so the same code
base can be re-used for server side connections. There are two ways of creating
a server side client.

1. When you've created your `primus` instance you can access the `Socket`
   property on it. This `Socket` is automatically configured to connect to the
   correct pathname, using the same `transformer` and `parser` that you've
   specified when you created your `primus` instance.

   ```js
   var primus = new Primus(server, { transformer: transformer, parser: parser })
     , Socket = primus.Socket;

   var client = new Socket('http://localhost:8080');
   //
   // It has the same interface as the client, so you can just socket.write or
   // listen for the `open` events etc.
   //
   ```
2. You might need to connect from a different node process where you don't have
   access to your `primus` instance and the compatible `Socket` instance. For
   these cases there a special `createSocket` method where you can specify the
   `transformer`, `parser`, `plugin` that you are using on your server to create
   another compatible socket.

   ```js
   var Socket = Primus.createSocket({ transformer: transformer, parser: parser })
     , client = new Socket('http://localhost:8080');
   ```
  ```

When you are using plugins with Primus make sure you add them **before** you
reference the `primus.Socket` or it will compile a client without your plugins.
If you're using the `Primus.createSocket` api you can directly supply the
plugins as part of the options as it supports `plugin` object:

​```js
var Socket = Primus.createSocket({
  transformer: transformer,
  parser: parser,
  plugin: {
    'my-emitter': require('my-emitter'),
    'substream': require('substream')
  }
});
  ```

The constructor returned by `primus.Socket` or `Primus.createSocket` has the
same signature of the constructor used to connect from the browser. This
means that you can use all the options mentioned in the previous
[section](#connecting-from-the-browser):

```js
var Socket = Primus.createSocket()
  , client = new Socket('http://localhost:8080', { options });
```

If you do not know which transformer and parser are used on the server, we
expose a small JSON "spec" file that exposes this information. The specification
can be reached on the `/<pathname>/spec` and will output the following JSON
document:

  ```json
  {
    "version":"2.4.0",
    "pathname":"/primus",
    "parser":"json",
    "transformer":"websockets"
  }
  ```

### Authorization

#### Server

Primus has a built-in auth hook that allows you to leverage the basic auth
header to validate the connection. To setup the optional auth hook, use the
`Primus#authorize` method:

```js
var authParser = require('basic-auth-parser');

//
// Add hook on server
//
primus.authorize(function (req, done) {
  var auth;

  try { auth = authParser(req.headers['authorization']) }
  catch (ex) { return done(ex) }

  //
  // Do some async auth check
  //
  authCheck(auth, done);
});

primus.on('connection', function (spark) {
  //
  // You only get here if you make it through the auth hook!
  //
});
```

In this particular case, if an error is passed to `done` by `authCheck` or
the exception handler then the connection attempt will never make it to the
`primus.on('connection')` handler.

The error you pass can either be a string or an object. If an object, it can
have the following properties which affect the response sent to the client:

- `statusCode`: The HTTP status code returned to the client. Defaults to 401.
- `authenticate`: If set and `statusCode` is 401 then a `WWW-Authenticate`
  header is added to the response, with a value equal to the `authenticate`
  property's value.
- `message`: The error message returned to the client. The response body will be
  `{error: message}`, JSON-encoded.

If the error you pass is a string then a 401 response is sent to the client
with no `WWW-Authenticate` header and the string as the error message.

For example to send 500 when an exception is caught, 403 for forbidden users
and details of the basic auth scheme being used when authentication fails:

```js
primus.authorize(function (req, done) {
  var auth;

  if (req.headers.authorization) {
    try { auth = authParser(req.headers.authorization) }
    catch (ex) {
      ex.statusCode = 500;
      return done(ex);
    }

    if ((auth.scheme === 'myscheme') &&
        checkCredentials(auth.username, auth.password)) {
      if (userAllowed(auth.username)) {
        return done();
      } else {
        return done({ statusCode: 403, message: 'Go away!' });
      }
    }
  }

  done({
    message: 'Authentication required',
    authenticate: 'Basic realm="myscheme"'
  });
});
```

#### Client

Unfortunately, the amount of detail you get in your client when authorization
fails depends on the transformer in use. Most real-time frameworks supported
by Primus don't expose the status code, headers or response body.

The WebSocket transformer's underlying transport socket will fire an
`unexpected-response` event with the HTTP request and response:

```js
primus.on('outgoing::open', function () {
  primus.socket.on('unexpected-response', function (req, res) {
    console.error(res.statusCode);
    console.error(res.headers['www-authenticate']);

    //
    // It's up to us to close the request (although it will time out).
    //
    req.abort();

    //
    // It's also up to us to emit an error so primus can clean up.
    //
    primus.socket.emit('error', 'authorization failed: ' + res.statusCode);
  });
});
```

If you want to read the response body then you can do something like this:

```js
primus.on('outgoing::open', function () {
  primus.socket.on('unexpected-response', function (req, res) {
    console.error(res.statusCode);
    console.error(res.headers['www-authenticate']);

    var data = '';

    res.on('data', function (v) {
      data += v;
    });

    res.on('end', function () {
      //
      // Remember error message is in the 'error' property.
      //
      primus.socket.emit('error', new Error(JSON.parse(data).error));
    });
  });
});
```

If `unexpected-response` isn't caught (because the WebSocket transformer isn't
being used or you don't listen for it) then you'll get an `error` event:

```js
primus.on('error', function error(err) {
  console.error('Something horrible has happened', err.stack);
});
```

As noted above, `err` won't contain any details about the authorization failure
so you won't be able to distinguish it from other errors.

### Broadcasting

Broadcasting allows you to write a message to every connected `Spark` on your server.
There are 2 different ways of doing broadcasting in Primus. The easiest way is to
use the `Primus#write` method which will write a message to every connected user:

```js
primus.write('message');
```

There are cases where you only want to broadcast a message to a smaller group of
users. To make it easier to do this, we've added a `Primus#forEach` method which
allows you to iterate over all active connections.

```js
primus.forEach(function (spark, id, connections) {
  if (spark.query.foo !== 'bar') return;

  spark.write('message');
});
```

The method can be also used asynchronously. To enable the asynchronous iteration
you have to call `Primus#forEach` with two arguments. The first is the iterator
function that is called on every step. The iterator is called with a connection
from the list and a callback for when it has finished. The second argument is
the main callback and is called when the iteration has finished.

```js
primus.forEach(function (spark, next) {
  //
  // Do something and call next when done
  //
  next();
}, function (err) {
  console.log('We are done');
});
```

There are also cases where you want to select a single `Spark`. To do this you
can use the `Primus#spark` method.

```js
// Get a spark by its id
var spark = primus.spark(id);

spark.write('message');
```

This method returns a `Spark` or `undefined` if the given id doesn't match any
of the active `Spark` ids on the server.

### Destruction

In rare cases you might need to destroy the Primus instance you've created. You
can use the `primus.destroy()` or `primus.end()` method for this. This method
accepts an Object which allows you to configure the destruction process:

- `close` Close the HTTP server that Primus received. Defaults to `true`.
- `reconnect` Automatically reconnect the clients. Defaults to `false`.
- `timeout` Close all active connections and clean up the Primus instance after
  the specified amount of timeout. Defaults to `0`.

The timeout is especially useful if you want gracefully shutdown your server but
really don't want to wait an infinite amount of time.

```js
primus.destroy({ timeout: 10000 });
```

### Events

Primus is built upon the Stream and EventEmitter interfaces. This is a summary
of the events emitted by Primus.

| Event                 | Usage      | Location      | Description                              |
| --------------------- | ---------- | ------------- | ---------------------------------------- |
| `outgoing::reconnect` | private    | client        | Transformer should reconnect.            |
| `reconnect scheduled` | **public** | client        | We're scheduling a reconnect.            |
| `reconnect`           | **public** | client        | Reconnect attempt is about to be made.   |
| `reconnected`         | **public** | client        | Successfully reconnected.                |
| `reconnect timeout`   | **public** | client        | Reconnect attempt took too much time.    |
| `reconnect failed`    | **public** | client        | Failed to reconnect.                     |
| `timeout`             | **public** | client        | Failed to connect to server.             |
| `outgoing::open`      | private    | client/spark  | Transformer should connect.              |
| `incoming::open`      | private    | client/spark  | Transformer has connected.               |
| `open`                | **public** | client        | Connection is open.                      |
| `destroy`             | **public** | client        | The instance has been destroyed.         |
| `incoming::error`     | private    | client        | Transformer received an error.           |
| `error`               | **public** | client/spark  | An error happened.                       |
| `incoming::data`      | private    | client/server | Transformer received data.               |
| `outgoing::data`      | private    | client/spark  | Transformer should write data.           |
| `data`                | **public** | client/spark  | We received data.                        |
| `incoming::end`       | private    | client/spark  | Transformer closed the connection.       |
| `outgoing::end`       | private    | client/spark  | Transformer should close connection.     |
| `end`                 | **public** | client/spark  | The connection has ended.                |
| `close`               | **public** | client/server | The connection has closed, we might reconnect. / The server has been destroyed. |
| `connection`          | **public** | server        | We received a new connection.            |
| `disconnection`       | **public** | server        | We received a disconnection.             |
| `initialised`         | **public** | server        | The server is initialised.               |
| `plugin`              | **public** | server        | A new plugin has been added.             |
| `plugout`             | **public** | server        | A plugin has been removed.               |
| `incoming::ping`      | private    | spark         | We received a ping message.              |
| `outgoing::ping`      | private    | client        | We're sending a ping message.            |
| `incoming::pong`      | private    | client        | We received a pong message.              |
| `outgoing::pong`      | private    | spark         | We're sending a pong message.            |
| `heartbeat`           | **public** | spark         | We've received a heartbeat and have reset the timer. |
| `online`              | **public** | client        | We've regained a network connection.     |
| `offline`             | **public** | client        | We've lost our internet connection.      |
| `log`                 | **public** | server        | Log messages.                            |
| `readyStateChange`    | **public** | client/spark  | The readyState has changed.              |
| `outgoing::url`       | private    | client        | The options used to construct the URL.   |

As a rule of thumb assume that every event that is prefixed with `incoming::` or
`outgoing::` is reserved for internal use only and that emitting such events your
self will most likely result in c̮̫̞͚͉̮̙͕̳̲͉̤̗̹̮̦̪̖̱h̛͍͙̖̟͕̹͕̙̦̣̲̠̪̯̳͖̝̩a̴̝̦͇̥̠̟͚̳̤̹̗̻̭͍͖͕͓̻o̥̹̮̙͔̗͍͚͓̗̦̹͈͙͕̘̮͖̝ș̗̲̤̗̮͈̙͈̹̼̣̹̖̱̤̼̺̤ ̻͙̗̥̠̱͇̱̝̟̺͍̺̼͆̅̓̓̇a̜̖͈͇͎͙̲̙̗͇̫̘̖̹͖͓͔̺̱n̹͓̮͇̯̜̤̗͍̯̰̫̫̖̰ͬ͌ͬͫd͚̪͚̭͚̥̰̤̟͎̝̲̯̭̹̭̙̼̤ ͖̞̙̹͈͚̥̦͚͉͖̼̬͓͚̳͉͙͎d̴͚̱̮̗͍̩̻̰̣̫͉͈̞̲͉̫̞͔ẻͩͦ̃͌̿̐ͪͩ̌̇͂̆̑͐ͣ ҉̲͉͔͎̤̼̘͇̮̥̻̜̹̥͚̲̻̖s̶̗̻̫̼̠̳̗̺̤̗̳͈̪̮̗̝͇͈t̙͇͕̺̱̼̤̗̰̬̣͌ͬͧ͊́ͧͩ͌r͌̐̓̃ͥ̄ͤ͑̈ͬ͆ͬ͂̇̿̅ ҉̙̼̳̭̙͍̻̱̠͈̮̺̣̝̱̙̺͉ư̳͎̻͔̯̪̝͕͚̣̜̼̞͇̠̘̠̪c̨̫͙͙̬̰̰̫̐͋͊͑̌̾̉͆t͚̗͕̝̤̗͕̲̮̝̼̺͙͚̟͓̣̥͍ĭ͙̘̩̖͇͎̆̍̿̾ͤ̔̉̈̂̾̈ͭo̬̠̝͈̺̙̮̬̗̪̤͕͇͕̰̮͖͉̬n̙̪̤̝̹͖͖̻̬̹͙̞̗͓̞̭̜̠̟.

To make it easier for developers to emit events on Primus itself, we've added a
small helper function that checks if the event you want to emit is reserved for
Primus only. This would be all `incoming::` and `outgoing::` prefixed events and
the events listed above. This method is called `<class>.reserved()` and it's
implemented on the `Spark`:

```js
primus.on('connection', function connection(spark) {
  spark.on('data', function (data) {
    //
    // Just imagine that we receive an array of arguments from the client which
    // first argument is the name of the event that we need to emit and the
    // second argument are the arguments for function.
    //
    if (spark.reserved(data.args[0])) return;

    spark.emit.apply(spark, data.args[0]);
  });
});
```

But also the client:

```js
var primus = new Primus('http://example.bar');

primus.on('data', function (data) {
  if (primus.reserved(data.args[0])) return;

  primus.emit.apply(primus, data.args);
});
```

And of course the `Primus` instance as well.

### Heartbeats and latency

Heartbeats are used in Primus to figure out if we still have an active, working
and reliable connection with the server. These heartbeats are sent from the
**client** to the server.

The heartbeats will only be sent when there is an idle connection, so there is
very little to no overhead at all. The main reason for this is that we already
know that the connection is alive when we receive data from the server.

The heartbeat package that we send over the connection is
`primus::ping::<timestamp>`. The server will echo back the exact same package.
This allows Primus to also calculate the latency between messages by simply
getting the `<timestamp>` from echo and comparing it with the local time. This
heartbeat is then stored in a `primus.latency` property. The initial value of
the `primus.latency` is to the time it took to send an `open` package and to
actually receive a confirmation that the connection has been opened.

### Supported Real-time Frameworks

The following transformers/transports are supported in Primus:

#### BrowserChannel

BrowserChannel was the original technology that GMail used for their real-time
communication. It's designed for same domain communication and does not use
WebSockets. To use BrowserChannel you need to install the `browserchannel`
module:

```
npm install browserchannel --save
```

And tell `Primus` that you want to use `browserchannel` as transformer:

```js
var primus = new Primus(server, { transformer: 'browserchannel' });
```

The `browserchannel` transformer comes with built-in node client support and can be
accessed using:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

Please note that you should use at least version `1.0.6` which contains support
for query strings.

#### Engine.IO

Engine.IO is the low level transport functionality of Socket.IO 1.0. It supports
multiple transports for creating a real-time connection. It uses transport
upgrading instead of downgrading which makes it more resilient to blocking
proxies and firewalls. To enable `engine.io` you need to install the `engine.io`
module:

```
npm install engine.io --save
```

And tell `Primus` that you want to use `engine.io` as transformer:

```js
var primus = new Primus(server, { transformer: 'engine.io' });
```

If you want to use the client interface inside of Node.js you also need to
install the `engine.io-client`:

```
npm install engine.io-client --save
```

And then you can access it from your server instance:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

#### Faye

Faye is a WebSocket only transformer. It uses the `faye-websocket` module which
is part of the [Faye](http://faye.jcoglan.com/) project and supports all
protocol specifications. To use this you need to install the `faye-websocket`
module:

```
npm install faye-websocket --save
```

And tell `Primus` that you want to use `faye` as transformer:

```js
var primus = new Primus(server, { transformer: 'faye' });
```

The `faye` transformer comes with built-in node client support and can be
accessed using:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

### lws

lws is a WebSocket only transformer. It uses the `lws` module which is a
libwebsockets wrapper for Node.js. To use lws you have to install
the `lws` module:

```
npm install lws --save
```

And tell `Primus` that you want to use `lws` as transformer:

```js
var primus = new Primus(server, { transformer: 'lws' });
```

If you want to use the client interface inside of Node.js you also need to
install the `ws` module:

```
npm install ws --save
```

And then you can access it from your server instance:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

#### Socket.IO

The Socket.IO transport was written against Socket.IO 0.9.x. It was one of the
first real-time servers written on Node.js and is one of the most used modules
in Node.js. It uses multiple transports to connect the server. To use Socket.IO
you need to install the `socket.io` module:

```
npm install socket.io@0.9.x --save
```

And tell `Primus` that you want to use `socket.io` as transformer:

```js
var primus = new Primus(server, { transformer: 'socket.io' });
```

If you want to use the client interface inside of Node.js you also need to
install the `primus-socket.io-client` module. This a fork of `socket.io-client`
maintained by us to fix the bugs found on the 0.9 branch which is no longer
supported upstream:

```
npm install primus-socket.io-client --save
```

If you want, you can opt out of our fixes and use the original `socket.io-client`.
To do that just install `socket.io-client` instead of `primus-socket.io-client`:

```
npm install socket.io-client@0.9.x --save
```

And then you can access it from your server instance:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

**Please keep in mind that the browser client will always use our fixes.**

**Note: Primus will never support Socket.IO 1.0. As it's just an abstraction built
upon Engine.IO so it makes more sense to use Engine.IO in Primus directly.
Socket.IO 0.9.x will be supported as it uses a completely different transport
system.**

#### SockJS

SockJS is a real-time server that focuses on cross-domain connections and does
this by using multiple transports. To use SockJS you need to install the
`sockjs` module:

```
npm install sockjs --save
```

And tell `Primus` that you want to use `sockjs` as transformer:

```js
var primus = new Primus(server, { transformer: 'sockjs' });
```

If you want to use the client interface inside of Node.js you also need to
install the `sockjs-client` module:

```
npm install sockjs-client --save
```

And then you can access it from your server instance:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

#### WebSockets

If you are targeting a high end audience or maybe just need something for
internal uses you can use a pure WebSocket server. This transformer uses the
popular `ws` module which is battle tested and supports all protocol
specifications. To use WebSockets you need to install the `ws` module:

```
npm install ws --save
```

And tell `Primus` that you want to use `WebSockets` as transformer:

```js
var primus = new Primus(server, { transformer: 'websockets' });
```

The `WebSockets` transformer comes with built-in node client support and can be
accessed using:

```js
var Socket = primus.Socket
  , socket = new Socket('url');
```

As you can see from the examples above, it doesn't matter how you write the name
of the transformer, we just `toLowerCase()` everything.

### Transformer inconsistencies

- BrowserChannel does not give you access to the `remotePort` of the incoming
  connection. So when you access `spark.address` the `port` property will be set
  to `1337` by default.
- BrowserChannel is the only transformer that does not support cross domain
  connections.
- BrowserChannel and SockJS are written in CoffeeScript and this can make
  debugging harder when their internals fail.
- Engine.IO and SockJS do not ship their client-side library with their server
  side component. We're bundling a snapshot of these libraries inside of Primus.
  We will always be targeting the latest version of these transformers when we
  bundle the library.
- lws only works on Linux and Mac OS X 10.7+ and only supports Node.js version 4 or
  5.
- lws does not currently support HTTPS to WSS. To work around this limitation
  you can use a SSL terminating reverse proxy.

### Parsers

In addition to support different frameworks we've also made it possible to use
custom encoding and decoding libraries. We're using `JSON` by default but you
could also use `binary` or `EJSON` for example (but these parsers need to be
supported by Primus, so check out the parser folder for examples). To specify
the parser to use you can supply a `parser` configuration option:

```js
var primus = new Primus(server, { parser: 'JSON' });
```

All parsers have an `async` interface for error handling.

### Middleware

Primus has two ways of extending the functionality. We have [plugins](#plugins)
but also support middleware. And there is an important difference between these.
The middleware layers allows you to modify the incoming requests **before** they
are passed in to the transformers. Plugins allow you to modify and interact with
the sparks. The middleware layer is only run for the requests that are handled
by Primus.

We support 2 kind of middleware, **async** and **sync** middleware. The main
difference between these kinds is that sync middleware doesn't require a
callback, it is completely optional. In Primus, we eat our own dog food. Various
of components in Primus are implemented through middleware layers:

- `cors`: Adds the Access Control headers.
- `primus.js`: It serves our `primus.js` client file.
- `spec`: It outputs the server specification (version, transformer, path).
- `authorization`: Our authorization handler, which is implemented as a middleware.
- `no-cache`: Add no-cache headers to every HTTP request.
- `x-xss`: Add `X-XSS-Protection` headers to every HTTP request.

#### Primus.before(name, fn, options, index)

The `primus.before` method is how you add middleware layers to your system. All
middleware layers need to be named. This allows you to also enable, disable and
remove middleware layers. The supplied function can either be a pre-configured
function that is ready to answer request/response or an unconfigured
middleware. An unconfigured middleware is a function with less then 2 arguments.
We execute this function automatically with `Primus` as context of the function
and optionally, the options that got provided:

```js
primus.before('name', function () {
  var primus = this;

  return function (req, res) {
    res.end('foo');
  }
}, { foo: 'bar' });
```

As you can see in the example above, we assume that you return the actual
middleware layer. If you don't need any pre-configuration you can just supply
the function directly:

```js
// sync middleware
primus.before('name', function (req, res) {

});

// async middleware
primus.before('name', function (req, res, next) {
  doStuff();
});
```

You need to be aware that these middleware layers are running for HTTP requests
but also for upgrade requests. Certain middleware layers should only run for
HTTP or Upgrade requests. To make it possible you can add a `http` or `upgrade`
property to the middleware function and set it to `false` if you don't want it
to be triggered.

```js
primus.before('name', function () {
  function middleware(req, res, next) {

  }

  middleware.upgrade = false; // Don't run this middleware for upgrades

  return middleware;
});
```

By default a new middleware layer is added after the previous one, but there
are cases where you need to add a middleware at a specified index in
the stack. To accomplish this you can use the optional 0 based `index`
argument.

```js
// add a middleware after the first two in the stack
primus.before('name', function (req, res) {

}, 2);
```

#### Primus.remove(name)

This method allows you to remove configured middleware. This works
for the middleware layers that you added but also the middleware layers that we
add by default. If you want to use a different way to serve the `primus.js`
file you can simply:

```js
primus.remove('primus.js');
```

And add your own middleware instead.

#### Primus.disable(name)

In addition to removing middleware layers, it's also possible to disable them so
they are skipped when we iterate over the middleware layers. It might be useful
to just disable certain middleware layers in production.

```js
primus.disable('name');
```

#### Primus.enable(name)

Of course, when you can disable middleware there also needs to be way to enable
them again. This is exactly what this method does. Re-enable a disabled
middleware layer.

```js
primus.enable('name');
```

### Plugins

Primus was built as a low level interface where you can build your applications
upon. At it's core, it's nothing more than something that passes messages back
and forth between the client and server. To make it easier for developers to
switch to Primus we've developed a simple but effective plugin system that
allows you to extend Primus's functionality.

Plugins are added on the server side in the form of an `Object`:

```js
//
// Require a plugin directly.
//
primus.use('name', require('metroplex'));

//
// Or supply it manually with the required object structure
//
primus.use('name', {
  server: function (primus, options) {},
  client: function (primus, options) {},
  library: 'client side library'
});
```

Or you can pass the plugin `Object` directly into the constructor:

```js
var primus = new Primus(server, { plugin: {
  name: {
    server: function (primus, options) {},
    client: function (primus, options) {},
    library: 'client side library'
  }
}})
```

And last but not least, you can also supply the constructor with a comma or
space separated list of plugin names which will be required automatically:

```js
var primus = new Primus(server, { plugin: 'metroplex, primus-emit' })
```

To remove added plugins you can use the `plugout` method:

```js
primus.use('name', require('metroplex'));
primus.plugout('name'); // returns true/false indicating successful removal.
```

The server function is only executed on the server side and receives 2
arguments:

1. A reference to the initialised Primus server.
2. The options that were passed in the `new Primus(server, { options })`
   constructor. So the plugin can be configured through the same interface.

The client receives the same arguments:

1. A reference to the initialised Primus client.
2. The options that were passed in the `new Primus(url, { options })`
   constructor. So the plugin can be configured through the same interface.

The only thing you need to remember is that the client is stored in the library
using `toString()` so it cannot have any references outside the client's
closure. But luckily, there's a `library` property that will also be included on
the client side when it's specified. The `library` property should be an
absolute path to the library file.

#### Intercepting the `connection` events

The `connection` event is emitted using a `async` emitter. It checks if your
supplied event emitter function has extra callback function. When it detects
this it will wait with the execution of the other assigned listeners until the
callback has been called. Please note that the order of assigning event
listeners is still respected so if you've assigned a `connection` listener
before an async connection listener it will still be executed first.

```js
primus.on('connection', function (spark) {
  console.log('first call, i have no spark.newproperty', spark.newproperty);
});

primus.on('connection', function (spark, next) {
  longrunningasynmethod(spark.query, function (err, data) {
    spark.newproperty = data;

    console.log('second call, i added the new property');
    next(err);
  });
});

primus.on('connection', function (spark) {
  console.log('third call, i can read the ', spark.newproperty);
});
```

When an error argument is supplied it will automatically end the connection and
emit an `error` event on the spark. If you are coming from Socket.IO 1.0 >=,
this will basically work the same way as their middleware system.

#### Extending the Spark / Socket

The server has a `.Spark` property that can be extended. This allows you to
easily add new functionality to the socket. For example adding join room
function would be as easy as:

```js
primus.use('rooms', {
  server: function (primus) {
    var Spark = primus.Spark;

    Spark.prototype.join = function () {
      // implement room functionality.
    };
  }
});
```

#### Transforming and intercepting messages

Intercepting and transforming messages is something that a lot of plugins
require. When your building an `EventEmitter` plugin or something else you
probably don't want the default `data` event to be emitted but your custom
event. There are 2 different types of messages that can be transformed:

1. `incoming` These messages are being received by the server.
2. `outgoing` These messages are being sent to the client.

The transformer is available on both the client and the server and share, like
you would have expected the same identical API. Adding a new transformer is
relatively straightforward:

```js
primus.transform('incoming', function (packet) {
  //
  // The packet.data contains the actual message that either received or
  // transformed.
  //

  // This would transform all incoming messages to foo;
  packet.data = 'foo';

  // If you are handling the message and want to prevent the `data` event from
  // happening, simply `return false` at the end of your function. No new
  // transformers will be called, and the event won't be emitted.
});
```

These transformations can easily be done in the plugins:

```js
primus.use('name', {
  server: function (primus) {
    primus.transform('outgoing', function (packet) {
      packet.data = 'foo';
    });

    primus.transform('incoming', function (packet) {
      if (packet.data === 'foo') packet.data = 'bar';
    });
  },

  client: function (primus) {
    primus.transform('outgoing', function (packet) {
      packet.data = 'foo';
    });

    primus.transform('incoming', function (packet) {
      if (packet.data === 'foo') packet.data = 'bar';
    });
  }
});
```

We also expose asynchronous interfaces for these transformers. If your function
accepts 2 arguments we automatically assume it's async and that the last
argument is the callback variable:

```js
primus.transform('outgoing', function (packet, next) {
  asyncprocess(packet.data, function (err, data) {
    //
    // If you return an error here, it will be emitted as `error` on the
    // spark/client and no `data` event will be emitted.
    //
    if (err) return next(err);

    //
    // If you just wanted to ignore this message instead of emitting an error
    // you can do:
    //
    if (err) return next(undefined, false);

    //
    // To update the data, just re-assign the `data` property on the packet you
    // received and call the next callback.
    //
    packet.data = data;
    next();
  });
});
```

#### Primus project plugins

The following plugins are part of the Primus project.

<dl>
  <dt><a href="https://github.com/primus/fortress-maximus">fortess-maximus</a></dt>
  <dd>
    Fortress Maximus validates every incoming message on your Primus server as all
    user input should be seen as a potential security risk.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/fortress-maximus"><img
      src="https://img.shields.io/npm/v/fortress-maximus.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/fortress-maximus"><img
      src="https://img.shields.io/travis/primus/fortress-maximus/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/metroplex">metroplex</a></dt>
  <dd>
    Metroplex is a Redis based spark/connection registry for Primus. It stores
    the sparks and their server address. So you can cluster multiple primus's
    together with Metroplex and Omega Supreme
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/metroplex"><img
      src="https://img.shields.io/npm/v/metroplex.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/metroplex"><img
      src="https://img.shields.io/travis/primus/metroplex/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/mirage">mirage</a></dt>
  <dd>
    Mirage generates and validates persistent session IDs.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/mirage"><img
      src="https://img.shields.io/npm/v/mirage.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/mirage"><img
      src="https://img.shields.io/travis/primus/mirage/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/omega-supreme">omega-supreme</a></dt>
  <dd>
    Omega Supreme allows you to broadcast messages to Primus using a regular
    HTTP request. These messages can be broacasted to every spark, single spark
    or a collection of sparks.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/omega-supreme"><img
      src="https://img.shields.io/npm/v/omega-supreme.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/omega-supreme"><img
      src="https://img.shields.io/travis/primus/omega-supreme/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/primus-analytics">primus-analytics</a></dt>
  <dd>
    Integrates Primus with Google Analytics.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-analytics"><img
      src="https://img.shields.io/npm/v/primus-analytics.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/primus-analytics"><img
      src="https://img.shields.io/travis/primus/primus-analytics/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/primus-emit">primus-emit</a></dt>
  <dd>
    The emit module adds client -> server and server -> client event emitting to Primus.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-emit"><img
      src="https://img.shields.io/npm/v/primus-emit.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/primus-emit"><img
      src="https://img.shields.io/travis/primus/primus-emit/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/primus/substream">substream</a></dt>
  <dd>
    Substream is an opinionated but stream compatible connection multiplexer on
    top of the Primus connections. These streams can be created without
    pre-defining them on the server or client.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/substream"><img
      src="https://img.shields.io/npm/v/substream.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/primus/substream"><img
      src="https://img.shields.io/travis/primus/substream/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

#### Community plugins

These are also plugins created by our amazing community. Do you have a module
that you want to have listed here? Make sure it has test suite and runs on
[Travis CI]. After that open a pull request where you added your module to this
README.md and see it be merged automatically.

<dl>
  <dt><a href="https://github.com/Shopetti/backbone.primus">backbone.primus</a></dt>
  <dd>Bind primus.io events to backbone models and collections.</dd>
  <dd>
    <a href="https://travis-ci.org/Shopetti/backbone.primus"><img
      src="https://img.shields.io/travis/Shopetti/backbone.primus/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt>
    <a href="https://github.com/latentflip/hapi_primus_sessions">
      hapi_primus_sessions
    </a>
  </dt>
  <dd>
    A hapi and primus plugin which extends primus' spark with a `getSession(cb)`
    method which returns the current hapi session object.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/hapi_primus_sessions"><img
      src="https://img.shields.io/npm/v/hapi_primus_sessions.svg?style=flat-square"
      alt="NPM version" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/lemonde/primus-cluster">primus-cluster</a></dt>
  <dd>Scale Primus across multiple servers or with node cluster.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-cluster"><img
      src="https://img.shields.io/npm/v/primus-cluster.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/neoziro/primus-cluster"><img
      src="https://img.shields.io/travis/neoziro/primus-cluster/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/cayasso/primus-emitter">primus-emitter</a></dt>
  <dd>A module that adds emitter capabilities to Primus.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-emitter"><img
      src="https://img.shields.io/npm/v/primus-emitter.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/cayasso/primus-emitter"><img
      src="https://img.shields.io/travis/cayasso/primus-emitter/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/zemirco/primus-express-session">primus-express-session</a></dt>
  <dd>Share a user session between Express and Primus.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-express-session"><img
      src="https://img.shields.io/npm/v/primus-express-session.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/zemirco/primus-express-session"><img
      src="https://img.shields.io/travis/zemirco/primus-express-session/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/cayasso/primus-multiplex">primus-multiplex</a></dt>
  <dd>A module that adds multiplexing capabilities to Primus.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-multiplex"><img
      src="https://img.shields.io/npm/v/primus-multiplex.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/cayasso/primus-multiplex"><img
      src="https://img.shields.io/travis/cayasso/primus-multiplex/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/mmalecki/primus-redis">primus-redis</a></dt>
  <dd>
    primus-redis is a Redis store for Primus. It takes care of distributing
    messages to other instances using Redis Pub/Sub.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-redis"><img
      src="https://img.shields.io/npm/v/primus-redis.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/mmalecki/primus-redis"><img
      src="https://img.shields.io/travis/mmalecki/primus-redis/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/mmalecki/primus-redis-rooms">primus-redis-rooms</a></dt>
  <dd>
    primus-redis-rooms is a Redis store for Primus and primus-rooms.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-redis-rooms"><img
      src="https://img.shields.io/npm/v/primus-redis-rooms.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/mmalecki/primus-redis-rooms"><img
      src="https://img.shields.io/travis/mmalecki/primus-redis-rooms/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/cayasso/primus-resource">primus-resource</a></dt>
  <dd>
    Define resources with auto-bound methods that can be called remotely on top of Primus.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-resource"><img
      src="https://img.shields.io/npm/v/primus-resource.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/cayasso/primus-resource"><img
      src="https://img.shields.io/travis/cayasso/primus-resource/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/swissmanu/primus-responder">primus-responder</a></dt>
  <dd>Client and server plugin that adds a request/response cycle to Primus.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-responder"><img
      src="https://img.shields.io/npm/v/primus-responder.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/swissmanu/primus-responder"><img
      src="https://img.shields.io/travis/swissmanu/primus-responder/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/cayasso/primus-rooms">primus-rooms</a></dt>
  <dd>
    A module that adds rooms capabilities to Primus. It's based on the rooms
    implementation of Socket.IO.
  </dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-rooms"><img
      src="https://img.shields.io/npm/v/primus-rooms.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/cayasso/primus-rooms"><img
      src="https://img.shields.io/travis/cayasso/primus-rooms/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

<dl>
  <dt><a href="https://github.com/Fishrock123/primus-spark-latency">primus-spark-latency</a></dt>
  <dd>Adds a latency property to primus sparks server-side.</dd>
  <dd>
    <a href="https://www.npmjs.com/package/primus-spark-latency"><img
      src="https://img.shields.io/npm/v/primus-spark-latency.svg?style=flat-square"
      alt="NPM version" /></a><a href="https://travis-ci.org/Fishrock123/primus-spark-latency"><img
      src="https://img.shields.io/travis/Fishrock123/primus-spark-latency/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>
</dl>

[Travis CI]: https://travis-ci.org/

### Community

Deployed Primus to production or built an awesome demo using the technology?
We've set up a special [wiki] page for it where you can show your awesome
creations or learn from demo and example applications how to use Primus.
Checkout the wiki page at:

https://github.com/primus/primus/wiki/Production

[wiki]: https://github.com/primus/primus/wiki

### FAQ

#### What is the best way to scale Primus

Scaling Primus is as simple as sticking it behind a load balancer that supports
[sticky sessions](https://github.com/primus/primus/issues/147) and run multiple
versions of your application. This is a vital feature that your load balancer
needs to support. This ensures that the incoming requests always go back to the
same server. If your load balancer does not support sticky sessions, get another
one. I highly recommend [HAProxy](http://www.haproxy.org/). According to my own
testing it is the fastest and best proxy available that supports WebSockets. See
https://github.com/observing/balancerbattle for more detailed information.

The reason for which sticky-sessions are so important is that a lot of frameworks
that use polling transports require to save a state in the node process in order
to work correctly. This state contains times, sessions ids, handshake data etc.
If a request from the same client does not enter the same node process it will
be treated as an `unknown` request and your real-time connection will be closed.

If you want more advanced scaling and messaging please take a look at the various
plugins we've written for this scope. Plugins like metroplex, omega-supreme and
primacron can be time savers.

#### Can I use cluster?

The `cluster` module that ships with Node.js is flawed, seriously flawed.
Cluster in node < 0.12.0 lets the Operating System decide which worker process
should receive the request. This results in a not even distribution across
the workers. If you have 3 workers, it's possible that one is used at 70%,
another at 20% and the last one at 10%. This is of course not wanted when using
a cluster. In addition, the load balancing done by the OS is not sticky.

Cluster in node >= 0.12.0 implements a custom round robin algorithm in order to
fix this un-even distribution of the load across the workers, but it does not
address the sticky session requirement.

There are also projects like `stick-session` which attempt to implement
sticky-sessions in cluster, but the problem with this specific approach is that
it uses the `remoteAddress` of the connection. For some people this isn't a
problem but when you add this behind a load balancer the remote address will be
set to the address of the load balancer that forwards the requests. So all in all
it only causes more scalability problems instead of solving them. This is why
we've opted to warn people about the risks of `cluster` when we detect that the
Primus library is run in a worker environment. **USE IT AT YOUR OWN RISK**.

To turn off the cluster warning in your Primus instance you can set the option
`iknowclusterwillbreakconnections` to `true`.

#### How do I use Primus with Express 3

Express 3's `express()` instance isn't a valid HTTP server. In order to make it
work with `Primus` and other real-time transformers you need to feed the instance
to a real `http` server and supply this server. See example below:

```js
'use strict';

var express = require('express')
  , Primus = require('primus')
  , app = express();

//
// Do your express magic.
//

var server = require('http').createServer(app)
  , primus = new Primus(server, { options });

server.listen(port);
```

#### Is require.js supported

Require.js is supported to a certain degree. The `primus.js` core file should be
compatible with require.js but it could be that the transformer of your choosing
isn't compatible with require.js. For example `engine.io` uses `component` which
introduces it's own `require` function that causes issues. In addition to that,
there are plugins which might use these modules that break require.js. The
general advice for this is to drop require.js in favour of plain script loading
or use of browserify where possible. If you feel strong about require.js we accept
pull requests that improve this behaviour or helps us save guard against these
issues.

#### Can I send custom headers to the server

It is not possible to send custom headers from the client to the server. This is
because these headers need to be set by the actual transports that the
transformers are using. The only transport that would support this would be AJAX
polling. To send custom data to the server use a query string in your connection
URL, as this is something that all transports support.

```js
var primus = new Primus('http://localhost:8080/?token=1&name=foo');
```

### Versioning

#### History

You can discover the version history and change logs on the
[Releases](https://github.com/primus/primus/releases) page

#### Convention

All `0.x.x` releases should be considered unstable and not ready for production.
The version number is laid out as: `major.minor.patch` and tries to follow
semver as closely as possible but this is how we use our version numbering:

<dl>
  <dt>major</dt>
  <dd>
    <p>
      A major and possible breaking change has been made in the primus core.
      These changes are not backwards compatible with older versions.
    </p>
  </dd>
  <dt>minor</dt>
  <dd>
    <p>
      New features are added or a big change has happened with one of the
      real-time libraries that we're supporting.
    </p>
  </dd>
  <dt>patch</dt>
  <dd>
    <p>
      A bug has been fixed, without any major internal and breaking changes.
    </p>
  </dd>
</dl>

#### Release cycle

There isn't a steady or monthly release cycle. We usually release a new version
when:

1. A critical bug is discovered.
2. There have been a lot of minor changes.
3. A framework did an incompatible update.
4. A new framework is added.
5. People ask for it.

### Other languages

These projects are maintained by our valuable community and allow you to use
Primus in a different language than JavaScript:

<dl>
  <dt><a href="https://github.com/seegno/primus-objc">primus-objc</a></dt>
  <dd>
    A client written in Objective-C for the Primus real-time framework with
    initial support for web sockets (via SocketRocket) and socket.io (via
    socket.IO-objc). Easily switch between different real-time Objective-C
    frameworks without any code changes.
  </dd>
  <dd>
    <a href="https://travis-ci.org/seegno/primus-objc"><img
      src="https://img.shields.io/travis/seegno/primus-objc/master.svg?style=flat-square"
      alt="Build Status" /></a>
  </dd>

  <dt><a href="https://github.com/cine-io/primus-android">primus-android</a></dt>
  <dd>
    A Primus client written in Java for Android with
    initial support for web sockets via <a href="https://github.com/koush/AndroidAsync">AndroidAsync</a>.
  </dd>
</dl>

Want to have your project listed here? Add it using a pull-request!

#### Protocol

Primus uses some internal protocol messages in order to keep the connection open
and stable between a client and a server. If you are planning on implementing
Primus in another language you must handle the following `primus::*` prefixed
messages:

- `primus::ping::<ping>` **client -> server**, The ping type contains the time
  in EPOCH. Ping messages are needed to keep the connection open as certain load
  balancers, proxies and browsers will close connections automatically when
  there is inactivity.
- `primus::pong::<ping>` **client <- server**, The pong is the response to the
  `ping` packet. It echoes back the exact value that it received so the client
  can calculate how long it took for the message to be received/replied by the
  server so we have the latency of the connection.
- `primus::server::close` **client <- server**, Indication that the server
  intentionally closed the connection and that no reconnection/connection should
  be made.
- `primus::id::` **client -> server**, Request of the internal `spark.id`
  that's assigned to the connection.
- `primus::id::<spark.id>` **client <- server**, The internal `id` that we used
  on the server to identify the connection as we do not sync this information by
  default and requires a `primus.id()` call on the client.

Any other message that is prefixed with `primus::` should be ignored and not
emitted to the user.

### License

[MIT](LICENSE)
