const Socket = require("./Socket");
const _ = require("lodash");

class Pub extends Socket {
  constructor(connection) {
    super(connection, "pub", Socket.CONNECTION_TYPE.BIND);

    // TODO: sendmore?
  }

  send(data, topic) {
    if (!_.isNil(topic)) {
      this.socket.send([topic, JSON.stringify(data)]);
    } else {
      super.send(data);
    }
  }
}

module.exports = Pub;
