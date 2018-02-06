let Socket = require("./Socket");

class Sub extends Socket {
  constructor(connection, topic) {
    super(connection, "sub", Socket.CONNECTION_TYPE.CONNECT);
    this.socket.subscribe(topic);
  }
}

module.exports = Sub;
