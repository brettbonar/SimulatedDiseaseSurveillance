const Socket = require("./Socket");

class Req extends Socket {
  constructor(connection) {
    super(connection, "req", Socket.CONNECTION_TYPE.CONNECT);
  }
}

module.exports = Req;
