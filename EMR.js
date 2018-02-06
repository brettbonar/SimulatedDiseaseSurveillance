const _ = require("lodash");

const Process = require("./Process");
const Disease = require("./Disease");
const Push = require("./Messaging/Push");
const Req = require("./Messaging/Req");

class EMR extends Process {
  constructor() {
    super("emr");
  }
  
  start(params) {
    this.simulation = params.simulation;
    this.hds = params.hds;
    this.push = new Push(this.hds.notification);
    this.outbreakReq = new Req(this.hds.outbreakRouter);
    this.outbreakReq.on((data) => this.printOutbreakStatus(data));

    setInterval(() => this.sendDiseaseNotification(), 100);
    setInterval(() => this.outbreakReq.send(), 1000);
  }

  sendDiseaseNotification() {
    let disease = _.sample(this.simulation.diseases);
    this.logger.debug("Sent disease notification: " + disease.name + " (" + disease.id + ")");
    this.push.send(new Disease({
      type: disease.id
    }).toJSON());
  }
  
  printOutbreakStatus(status) {
    this.logger.debug("Outbreaks: " + JSON.stringify(status));
  }
}

let process = new EMR();
process.init();
