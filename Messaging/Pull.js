let Socket = require("./Socket");

class Pull extends Socket {
  constructor(connection) {
    super(connection, "pull", Socket.CONNECTION_TYPE.BIND);
  }
}

module.exports = Pull;
