var path = require('path');
var fs = require('fs');

// koa modules
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var views = require('co-views');
var app = koa();

const STATIC = '/public';

var render = views(__dirname + '/views', {
  ext: 'jade'
});

app.use(logger())
app.use(route.get('/', index));
app.use(route.get('/css/*', publicStream));
app.use(route.get('/js/*', publicStream));
app.listen(4000);

function *index() {
  this.body = yield render('index');
}

function *publicStream() {
  var p = __dirname + STATIC + this.path;
  this.type = path.extname(p);
  this.body = fs.createReadStream(p);
}

// web socket
var ws = require('websocket.io');
var server = ws.listen(8124);
var list = [];

server.on('connection', function (socket) {
  socket.on('message', function (data) {
    var json = JSON.parse(data);
    switch (json.type) {
      case 0:
        // register
        if (list.indexOf(json.guid) === -1) {
          list.push(json.guid);
        }
        json.list = list;
        break;
      case 1:
      case 2:
      default:
        break;
    }
    data = JSON.stringify(json);
    server.clients.forEach(function (client) {
      if (client) {
        client.send(data);
      }
    });
  });
});
