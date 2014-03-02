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
        break;
      case 2:
        break;
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

  socket.on('close', function () {
  });
});
