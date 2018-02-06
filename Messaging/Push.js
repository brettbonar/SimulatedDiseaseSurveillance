const Socket = require("./Socket");

class Push extends Socket {
  constructor(connection) {
    super(connection, "push", Socket.CONNECTION_TYPE.CONNECT);
  }
}

module.exports = Push;
