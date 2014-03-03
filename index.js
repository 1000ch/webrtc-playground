// web server
var express = require('express');
var app = express();

// set up
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// route
app.get('/', function (request, response) {
  response.render('index');
});

// listen
app.listen(3000);

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
    data = JSON.stringify(json);console.log(json);
    server.clients.forEach(function (client) {
      if (client) {
        client.send(data);
      }
    });
  });
});
