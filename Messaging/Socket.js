const _ = require("lodash");
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

class Socket extends zmq.Socket {
  constructor(connection, socketType, connectionType) {
    super(socketType);
    this.socketType = socketType;
    this.connectionType = connectionType;

    if (connection) {
      this.connect(connection);
    }
  }

  connect(connection) {
    if (_.isArray(connection)) {
      this.connection = _.map(connection, getAddress);
    } else {
      this.connection = getAddress(connection);
    }

    if (this.connectionType === CONNECTION_TYPE.CONNECT) {
      if (_.isArray(this.connection)) {
        _.each(this.connection, (conn) => super.connect(conn));
      } else {
        super.connect(this.connection);
      }
    } else {
      this.bindSync(this.connection);
    }
  }

  send(data, id) {
    data = JSON.stringify(data);
    if (!_.isUndefined(id)) {
      super.send([id, "", data]);
    } else {
      // TODO: find out if above will always work
      super.send(data);
    }
  }

  on(cb) {
    super.on("message", function (data) {
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
