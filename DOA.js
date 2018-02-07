const _ = require("lodash");

const Process = require("./Process");
const Pull = require("./Messaging/Pull");
const Pub = require("./Messaging/Pub");
const Sub = require("./Messaging/Sub");

const SIMULATION_INTERVAL = 1000;

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
    this.currentHour = 0;
    this.diseaseCounts = Array(this.simulation.simulationTime).fill(0);
    this.outbreaking = false;

    this.diseaseUpdateSub = new Sub(_.map(params.hds, "update"), params.doa.disease.toString());
    this.diseaseUpdateSub.on((data) => this.onDiseaseUpdate(data));
    this.diseaseOutbreakPub = new Pub(this.connection);

    // Update simulation every second
    setInterval(() => this.updateSimulation(), SIMULATION_INTERVAL);
  }

  onDiseaseUpdate(data) {
    this.updateVectorTimestamp(data.vectorTimestamp);
    this.logger.debug("Disease update: " + JSON.stringify(_.omit(data, "vectorTimestamp"), null, 2));
    this.diseaseCounts[this.currentHour] += data.count;
    this.logger.debug("Counts: " + JSON.stringify(this.diseaseCounts));

    this.notifyOutbreaks();
  }

  notifyOutbreaks() {
    this.updateVectorTimestamp();
    let sum = _.sum(this.diseaseCounts);
    if (sum > this.disease.threshold && !this.outbreaking) {
      this.outbreaking = true;
      let message = {
        type: this.disease.id,
        infections: sum,
        vectorTimestamp: this.vectorTimestamp
      };
      this.diseaseOutbreakPub.send(message, "outbreak");
      this.logger.debug("Published disease outbreak: " + JSON.stringify(_.omit(message, "vectorTimestamp"), null, 2));
    } else if (this.outbreaking) {
      this.outbreaking = false;
    }
  }

  updateSimulation() {
    this.updateVectorTimestamp();
    this.currentHour = (this.currentHour + 1) % this.simulation.simulationTime;
    this.diseaseCounts[this.currentHour] = 0;
  }
}

let process = new DOA();
process.init();
