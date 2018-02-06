const _ = require("lodash");
const Socket = require("./Socket");

class Sub extends Socket {
  constructor(connection, topic) {
    super(connection, "sub", Socket.CONNECTION_TYPE.CONNECT);
    if (!_.isNil(topic)) {
      this.socket.subscribe(topic);
    }
  }
}

module.exports = Sub;
