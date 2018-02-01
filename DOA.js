let Process = require("./Process");
let Pull = require("./Messaging/Pull");

class DOA extends Process {
  constructor() {
    super("doa");
  }

  start(params) {
    this.connection = {
      ip: params.doa.ip,
      port: params.doa.port
    };
  
    this.puller = new Pull(this.connection);
    this.puller.on(function (data) {
      console.log(data);
    });
  }
}

let process = new DOA();
process.init();
