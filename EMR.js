let _ = require("lodash");

let Process = require("./Process");
let Disease = require("./Disease");
let Push = require("./Messaging/Push");

class EMR extends Process {
  constructor() {
    super("emr");
  }
  
  start(params) {
    this.hds = params.hds;
    this.push = new Push(this.hds);
    setInterval(() => this.sendDiseaseNotification(), 1000);
  }

  sendDiseaseNotification() {
    let disease = new Disease({
      type: _.sample(this.diseases).id
    });
    console.log("Send");
    this.push.send(disease.toJSON());
  }
}

let process = new EMR();
process.init();
