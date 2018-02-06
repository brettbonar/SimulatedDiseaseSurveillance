const _ = require("lodash");
const q = require("q");
const zmq = require("zmq");

let CONNECTION_TYPE = {
  CONNECT: "connect",
  BIND: "bind"
}

function getAddress(connection) {
  let ip = connection.ip;
  if (ip === "localhost") {
    ip = "127.0.0.1";
  }
  return "tcp://" + ip + ":" + connection.port;
}

class Socket {
  constructor(connection, socketType, connectionType) {
    if (_.isArray(connection)) {
      this.connection = _.map(connection, getAddress);
    } else {
      this.connection = getAddress(connection);
    }

    this.socketType = socketType;
    this.connectionType = connectionType;
    
    let socket = zmq.socket(this.socketType);
    if (this.connectionType === CONNECTION_TYPE.CONNECT) {
      if (_.isArray(this.connection)) {
        _.each(this.connection, (conn) => socket.connect(conn));
      } else {
        socket.connect(this.connection);
      }
    } else {
      socket.bindSync(this.connection);
    }

    this.socket = socket;

    // Make socket a "deferred"
    let deferred = q.defer();
    _.assign(this, deferred);
  }

  send(data, id) {
    if (_.isUndefined(data)) {
      data = "";
    }
    data = JSON.stringify(data);
    if (!_.isUndefined(id)) {
      this.socket.send([id, "", data]);
    } else {
      // TODO: find out if above will always work
      this.socket.send(data);
    }
  }

  on(cb) {
    this.socket.on("message", function (data) {
      let from = null; // will be sender id or publish topic
      if (arguments.length > 1) {
        let args = Array.apply(null, arguments);
        from = args[0];
        data = JSON.parse(args[args.length - 1].toString());
      } else {
        data = JSON.parse(data.toString());
      }
      cb(data, from);
    });
  }

  static get CONNECTION_TYPE() {
    return CONNECTION_TYPE;
  }
}

module.exports = Socket;
