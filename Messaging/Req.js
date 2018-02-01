let Socket = require("./Socket");

class Req extends Socket {
  constructor(connection) {
    super(connection, "req", Socket.CONNECTION_TYPE.CONNECT);
  }

  send(data) {
    let that = this;
    super.send(data);
    super.on(function (data) {
      that.resolve(data);
    });

    return this.promise;
  }
}

module.exports = Req;
