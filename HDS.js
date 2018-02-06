const _ = require("lodash");
const moment = require("moment");

const Process = require("./Process");
const Disease = require("./Disease");
const Pull = require("./Messaging/Pull");
const Pub = require("./Messaging/Pub");
const Sub = require("./Messaging/Sub");
const Router = require("./Messaging/Router");

class HDS extends Process {
  constructor() {
    super("hds");
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
    this.outbreakSub = new Sub(params.doa);
    this.outbreakSub.on((data) => this.handleOutbreakNotification(data));
    this.diseaseOutbreakRouter = new Router(this.settings.outbreakRouter);
    this.diseaseOutbreakRouter.on((data) => this.handleDiseaseOutbreakReq(data));

    setInterval(() => this.publishDiseases(), 200);
  }

  handleDiseaseNotification(data) {
    let diseaseCnt = _.find(this.diseaseCounts, { type: data.type });
    if (!diseaseCnt) {
      diseaseCnt = {
        type: data.type,
        count: 0
      };
      this.diseaseCounts.push(diseaseCnt);
    }
    diseaseCnt.count += 1;
    this.logger.debug("Received disease notification (" + _.find(this.simulation.diseases, { id: data.type }).name + "): " + diseaseCnt.count);
  }
  
  handleOutbreakNotification(data) {
    this.logger.debug("Disease Outbreak (" + _.find(this.simulation.diseases, { id: data.type }).name + ")");
    this.diseaseOutbreaks.push({
      time: moment().valueOf(),
      infections: data.infections,
      type: data.type
    });
  }

  publishDiseases() {
    // Notify associated DOA
    // TODO: make sent message type a class
    _.each(this.diseaseCounts, (disease) => {
      let message = {
        hds: this.id,
        disease: disease.type,
        count: disease.count,
        vectorTimestamp: []
      };
      this.diseaseUpdatePublisher.send(message, "A");
      this.logger.debug("Published disease count: " + JSON.stringify(message));
    });
  }

  handleDiseaseOutbreakReq(data, from) {
    // Respond with list of outbreaks from last simulation time period
    let minTime = moment().subtract(this.simulation.simulationTime, "seconds").valueOf();
    let outbreaks = _.takeRightWhile(this.diseaseOutbreaks, (outbreak) => outbreak.time > minTime);
    this.diseaseOutbreakRouter.send({
      time: moment().valueOf(),
      outbreaks: outbreaks,
      vectorTimestamp: []
    }, from);
  }
}

let process = new HDS();
process.init();
