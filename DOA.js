const _ = require("lodash");

const Process = require("./Process");
const Pull = require("./Messaging/Pull");
const Pub = require("./Messaging/Pub");
const Sub = require("./Messaging/Sub");

class DOA extends Process {
  constructor() {
    super("doa");
  }

  start(params) {
    this.simulation = params.simulation;
    this.connection = {
      ip: params.doa.ip,
      port: params.doa.port
    };
  
    this.diseaseUpdateSub = new Sub(_.map(params.hds, "update"), "A");
    this.diseaseUpdateSub.on((data) => this.onDiseaseUpdate(data));

    this.diseaseOutbreakPub = new Pub(this.connection);

    this.disease = params.doa.disease;
    this.currentHour = 0;
    this.diseaseCounts = Array(this.simulation.simulationTime).fill(0);
    this.totalCount = 0;

    // Update simulation every hour
    setInterval(() => this.updateSimulation(), 1000);
  }

  onDiseaseUpdate(data) {
    this.logger.debug("Disease update: " + JSON.stringify(data));
    let diff = data.count - this.totalCount;
    this.totalCount = data.count;
    this.diseaseCounts[data.type] += diff;
  }

  updateSimulation() {
    // Check if an outbreak has occurred. Continue to broadcast outbreak notification each hour
    // as long as outbreak is still active.
    let sum = _.sum(this.diseaseCounts);
    if (sum > this.disease.threshold) {
      this.diseaseOutbreakPub.send({
        type: data.type,
        infections: sum,
        vectorTimestamp: []
      }, "outbreak");
    }

    this.currentHour = (this.currentHour + 1) % this.simulation.simulationTime;
    this.diseaseCounts[this.currentHour] = 0;
  }
}

let process = new DOA();
process.init();
