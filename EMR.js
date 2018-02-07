const _ = require("lodash");

const Process = require("./Process");
const DiseaseNotification = require("./Messages/DiseaseNotification");
const Push = require("./Messaging/Push");
const Req = require("./Messaging/Req");

const OUTBREAK_REQ_INTERVAL = 1000;

class EMR extends Process {
  constructor(options) {
    super(options);
  }
  
  start(params) {
    this.simulation = params.simulation;
    this.hds = params.hds;
    this.push = new Push(this.hds.notification);

    _.each(this.simulation.diseases, (disease) => {
      disease.changeP = ((disease.maxP - disease.minP) / disease.ratePeriod) / (1000 / this.simulation.simulationInterval);
      disease.deltaP = disease.changeP;
      disease.probability = disease.minP;
    });

    setInterval(() => this.simulateDiseases(), this.simulation.simulationInterval);
    setInterval(() => this.sendOutbreakReq(), OUTBREAK_REQ_INTERVAL);
  }

  sendDiseaseNotification(disease) {
    this.vectorTimestamp.update();
    this.logger.debug("Sent disease notification: " + disease.name + " (" + disease.id + ")");
    this.push.send(new DiseaseNotification({
      type: disease.id,
      vectorTimestamp: this.vectorTimestamp
    }).toJSON());
  }

  simulateDiseases() {    
    _.each(this.simulation.diseases, (disease) => {
      disease.probability = disease.probability + disease.deltaP;
      if (Math.random() <= disease.probability) {
        sendDiseaseNotification(disease);
      }

      if (disease.probability > disease.maxP) {
        disease.probability = disease.maxP;
        disease.deltaP = -disease.changeP;
      } else if (disease.probability < disease.minP) {
        disease.probability = disease.minP;
        disease.deltaP = disease.changeP;
      }
    });
  }

  sendOutbreakReq() {
    this.vectorTimestamp.update();
    this.req = new Req(this.hds.outbreakRouter);
    this.req.on((data) => this.handleOutbreakRep(data));
    this.req.send({
      vectorTimestamp: this.vectorTimestamp.get()
    });
    this.logger.debug("Sent outbreak request");
  }
  
  handleOutbreakRep(status) {
    this.vectorTimestamp.update(status.vectorTimestamp);
    this.logger.debug("Got outbreak response");
    if (status.outbreaks.length > 0) {
      _.each(status.outbreaks, (outbreak) => {
        outbreak.name = _.find(this.simulation.diseases, { id: outbreak.type }).name;
        outbreak.time = new Date(outbreak.time).toString();
      });
      this.logger.info("Outbreaks: " + JSON.stringify(status.outbreaks, null, 2));
    }
  }
}

module.exports = EMR;
