# cicada

a teeny git-based continuous integration server

[![build status](https://secure.travis-ci.org/substack/cicada.png)](http://travis-ci.org/substack/cicada)

# example

Just hack up a cicada server:

``` js
var http = require('http');
var cicada = require('cicada');

var ci = cicada('/tmp/blarg');
ci.on('commit', function (commit) {
    commit.run('test').on('exit', function (code) {
        var status = code === 0 ? 'PASSED' : 'FAILED';
        console.log(commit.hash + ' ' + status);
    });
});

var server = http.createServer(ci.handle);
server.listen(5255);
```

run it

```
$ node example/ci.js 
```

push some code to it:

```
$ git push http://localhost:5255/choose.git 
To http://localhost:5255/choose.git
   c79cef8..3537c0f  master -> master
```

and watch the results whiz by!

```
b7c19c9fd2c34176bd6eef436a69ab7a470ff98d PASSED
c79cef8c54a9abc2b2d6ecd179d41463767be526 FAILED
3537c0f83606788bdfb065242a6851b20504fe3e PASSED
```

# methods

``` js
var cicada = require('cicada')
```

## var ci = cicada(opts, cb)

Create a new ci server using `opts.repodir` for storing git blobs and
`opts.workdir` for checking out code.

If `opts.repodir` is a function, check out repositories to the directory
specified by the return value of `opts.repodir(repo)` where `repo` is the repo
name as a string.

If `opts.workdir` is a function, check out repositories to the directory
specified by the return value of `opts.workdir(commit)` where `commit` is a
commit object described below.

If `opts` is a string, use `opts + '/repo'` and `opts + '/work'`.

If `opts.basedir` is a string, use `opts.basedir + '/repo'` and `opts.basedir + '/work'`.

If `opts.bare` is `true` the repo will not be checked out into the `workdir` during a push. If not specified `opts.bare` defaults to `false`.

If `cb` is provided, it acts as a listener for the `'commit'` event.

## ci.handle(req, res)

Handle requests from an http server. This is necessary to make git work over
http.

## ci.checkout(repo, commit, branch, cb)

Manually check out a commit into the workdir.

The errback `cb(err, commit)` fires with an error or a commit object.

# events

## ci.on('push', function (push) {})

Emitted when somebody pushes to the server.

`push` comes from the [`pushover`](https://github.com/substack/pushover#reposonpush-function-push---) module.

If you implement a `on('push')` handler you must call `push.accept()` inside of it for the push to complete, otherwise the git client will hang on the other end.

## ci.on('commit', function (commit) {})

After a push occurs, the commit will be checked out into the workdir.
Once the commit is all checked out, this event fires with a commit handle
described below.

## ci.on('error', function (err) {}

Emitted when errors occur.

# commit object

Commit objects are emitted by the `'commit'` event or they may be created
manually with the `ci.checkout()` function.

## commit.run(scriptName, opts)

Run a command from the package.json script hash with `npm run-script`.

Returns the process object.

## commit.spawn(command, args, opts)

Spawn an ordinary shell command in the `commit.dir`.

Returns the process object.

## commit properties

commit objects have these properties:

* commit.hash - the full git hash string for this commit
* commit.id - a combination of the hash and the date in microseconds
* commit.dir - the working directory the commit is checked out into
* commit.repo - the repository this commit came from
* commit.branch - the branch this commit came from

# install

With [npm](http://npmjs.org) do:

```
npm install cicada
```

# license

MIT
