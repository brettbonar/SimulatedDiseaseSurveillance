let Process = require("./Process");
let Pull = require("./Messaging/Pull");
let Pub = require("./Messaging/Pub");
let Sub = require("./Messaging/Sub");

class DOA extends Process {
  constructor() {
    super("doa");
  }

  start(params) {
    this.connection = {
      ip: params.doa.ip,
      port: params.doa.port
    };
  
    this.diseaseUpdateSub = new Sub(_.map(params.hds, "update"));
    this.diseaseUpdateSub.on(this.onDiseaseUpdate);

    this.diseaseOutbreakPub = new Pub(this.connection);
  }

  onDiseaseUpdate(data) {
    console.log(data);
    this.diseaseOutbreakPub.send(data.type, "outbreak");
  }
}

let process = new DOA();
process.init();
