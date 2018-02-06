let Socket = require("./Socket");

class Pub extends Socket {
  constructor(connection) {
    super(connection, "pub", Socket.CONNECTION_TYPE.BIND);

    // TODO: sendmore?
  }
}

module.exports = Pub;
