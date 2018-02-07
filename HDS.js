const _ = require("lodash");
const moment = require("moment");

const Process = require("./Process");
const Pull = require("./Messaging/Pull");
const Pub = require("./Messaging/Pub");
const Sub = require("./Messaging/Sub");
const Router = require("./Messaging/Router");

class HDS extends Process {
  constructor(options) {
    super(options);
  }
  
  start(params) {
    this.simulation = params.simulation;
    this.settings = params.hds;

    this.diseaseCounts = [];
    this.diseaseOutbreaks = [];

    // Establish sockets
    this.diseaseUpdatePublisher = new Pub(this.settings.update);
    this.diseaseNotificationPuller = new Pull(this.settings.notification);
    this.diseaseNotificationPuller.on((data) => this.handleDiseaseNotification(data));
    
    this.outbreakSub = new Sub(params.doa, "outbreak");
    this.outbreakSub.on((data) => this.handleOutbreakNotification(data));
    this.diseaseOutbreakRouter = new Router(this.settings.outbreakRouter);
    this.diseaseOutbreakRouter.on((data, id) => this.handleDiseaseOutbreakReq(data, id));

    setInterval(() => this.publishDiseases(), 1000);
  }

  handleDiseaseNotification(data) {
    this.vectorTimestamp.update(data.vectorTimestamp);
    let diseaseCnt = _.find(this.diseaseCounts, { type: data.type });
    if (!diseaseCnt) {
      diseaseCnt = {
        type: data.type,
        count: 0,
        lastCount: 0
      };
      this.diseaseCounts.push(diseaseCnt);
    }
    diseaseCnt.count += 1;
    this.logger.debug("Received disease notification (" + _.find(this.simulation.diseases, { id: data.type }).name + ") from: " + data.id);
  }
  
  handleOutbreakNotification(data) {
    this.vectorTimestamp.update(data.vectorTimestamp);
    this.logger.debug("Disease Outbreak (" + _.find(this.simulation.diseases, { id: data.type }).name + ")");
    this.diseaseOutbreaks.push({
      time: moment().valueOf(),
      infections: data.infections,
      type: data.type
    });
  }

  publishDiseases() {
    // Notify associated DOA
    this.vectorTimestamp.update();
    _.each(this.diseaseCounts, (disease) => {
      if (disease.count != disease.lastCount) {
        let message = {
          hds: this.id,
          disease: disease.type,
          count: disease.count - disease.lastCount,
          vectorTimestamp: this.vectorTimestamp.get()
        };
        disease.lastCount = disease.count;
        this.diseaseUpdatePublisher.send(message, disease.type.toString());
        this.logger.debug("Published disease count: " + JSON.stringify(_.omit(message, "vectorTimestamp"), null, 2));
      }
    });
  }

  handleDiseaseOutbreakReq(data, id) {
    this.vectorTimestamp.update(data.vectorTimestamp);
    this.logger.debug("Got disease outbreak req");
    // Respond with list of outbreaks from last simulation time period
    let minTime = moment().subtract(this.simulation.simulationTime, "seconds").valueOf();
    let outbreaks = _.takeRightWhile(this.diseaseOutbreaks, (outbreak) => outbreak.time > minTime);
    let message = {
      time: moment().valueOf(),
      outbreaks: outbreaks,
      vectorTimestamp: this.vectorTimestamp.get()
    };
    
    this.vectorTimestamp.update();
    this.diseaseOutbreakRouter.send(message, id);
    this.logger.debug("Sent disease outbreak response: " + 
      JSON.stringify(_.omit(message, "vectorTimestamp"), null, 2));
  }
}

module.exports = HDS;
