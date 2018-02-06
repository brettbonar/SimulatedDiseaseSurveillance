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
  
    this.disease = _.find(this.simulation.diseases, { id: params.doa.disease });

    this.diseaseUpdateSub = new Sub(_.map(params.hds, "update"), params.doa.disease.toString());
    this.diseaseUpdateSub.on((data) => this.onDiseaseUpdate(data));

    this.diseaseOutbreakPub = new Pub(this.connection);

    this.currentHour = 0;
    this.diseaseCounts = Array(this.simulation.simulationTime).fill(0);

    // Update simulation every hour
    setInterval(() => this.updateSimulation(), 1000);
  }

  onDiseaseUpdate(data) {
    this.logger.debug("Disease update: " + JSON.stringify(data));
    this.diseaseCounts[this.currentHour] += data.count;
    this.logger.debug("Counts: " + JSON.stringify(this.diseaseCounts));
  }

  updateSimulation() {
    // Check if an outbreak has occurred. Continue to broadcast outbreak notification each hour
    // as long as outbreak is still active.
    let sum = _.sum(this.diseaseCounts);
    if (sum > this.disease.threshold) {
      let message = {
        type: this.disease.id,
        infections: sum,
        vectorTimestamp: []
      };
      this.diseaseOutbreakPub.send(message, "outbreak");
      this.logger.debug("Published disease outbreak: " + JSON.stringify(message));
    }

    this.currentHour = (this.currentHour + 1) % this.simulation.simulationTime;
    this.diseaseCounts[this.currentHour] = 0;
  }
}

let process = new DOA();
process.init();
