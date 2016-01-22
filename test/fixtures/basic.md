# hello world

paragraph

## example

```js
var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/indenting', function (req, res) {
	res.send('Hello World')
	res.send('Hello Someone Else')
	if (foo) {
		// doubly indented
	}
})

app.listen(3000)
```

```sh
echo hi
```

```coffeescript
alert "hi"
```

```diff
-removed
+added
```

### images

![](relative.png)
![](/slashy/deep.png)
![](//protocollie.com/woof.png)
![](http://insecure.com/bad.png)
![](https://secure.com/good.png)

#### h4, anyone

[youtube video link](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

<iframe src="//www.youtube.com/embed/3I78ELjTzlQ" frameborder="0" allowfullscreen></iframe>

<iframe src="https://www.youtube.com/embed/DN4yLZB1vUQ"></iframe>

<iframe src="//malware.com" allowfullscreen></iframe>

<iframe src="http://malware.com/infect//www.youtube.com/embed/yWeAZEqNCXM" frameborder="0" allowfullscreen></iframe>

<iframe src='delete-account#//youtube.com' />

<iframe src='data:application,this is a malware containing the string //youtube.com' />
