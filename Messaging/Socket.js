let _ = require("lodash");
let q = require("q");
let zmq = require("zmq");

let CONNECTION_TYPE = {
  CONNECT: "connect",
  BIND: "bind"
}

function getAddress(ip, port) {
  if (ip === "localhost") {
    ip = "127.0.0.1";
  }
  return "tcp://" + ip + ":" + port;
}

class Socket {
  constructor(connection, socketType, connectionType) {
    this.address = getAddress(connection.ip, connection.port);
    this.socketType = socketType;
    this.connectionType = connectionType;
    
    let socket = zmq.socket(this.socketType);
    if (this.connectionType === CONNECTION_TYPE.CONNECT) {
      socket.connect(this.address);
    } else {
      socket.bindSync(this.address);
    }

    this.socket = socket;

    // Make socket a "deferred"
    let deferred = q.defer();
    _.assign(this, deferred);
  }

  send(data, id) {
    data = JSON.stringify(data);
    if (!_.isUndefined(id)) {
      this.socket.send([id, "", data]);
    } else {
      // TODO: find out if above will always work
      this.socket.send(data);
    }
  }

  on(cb) {
    this.socket.on("message", function (message, empty, data) {
      if (arguments.length > 1) {
        data = JSON.parse(data.toString());
      } else {
        data = JSON.parse(message.toString());
      }
      // TRICKY: if arguments.length > 1 then message will actually be sender ID
      cb(data, message);
    });
  }

  static get CONNECTION_TYPE() {
    return CONNECTION_TYPE;
  }
}

module.exports = Socket;
