let _ = require("lodash");

let Process = require("./Process");
let Disease = require("./Disease");
let Pull = require("./Messaging/Pull");
let Pub = require("./Messaging/Pub");
let Sub = require("./Messaging/Sub");

class HDS extends Process {
  constructor() {
    super("hds");
    this.doas = {};
    this.diseaseCounts = {};
  }
  
  start(params) {
    let that = this;

    this.notificationConnection = {
      ip: params.hds.notification.ip,
      port: params.hds.notification.port
    };
    
    this.updateConnection = {
      ip: params.hds.update.ip,
      port: params.hds.update.port
    };

    // _.each(params.doa, function (doa) {
    //   that.doas[doa.disease] = new Push({ ip: doa.ip, port: doa.port });
    // });

    this.diseaseUpdatePublisher = new Pub(this.updateConnection);
    this.diseaseNotificationPuller = new Pull(this.notificationConnection);
    this.diseaseNotificationPuller.on((data) => this.handleDiseaseNotification(data));

    this.outbreakSub = new Sub(params.doa);
    this.outbreakSub.on((data) => this.handleOutbreakNotification(data));

    setInterval(() => this.publishDiseases(this.diseaseCounts), 1000);
  }

  handleDiseaseNotification(data) {
    if (_.isUndefined(this.diseaseCounts[data.type])) {
      this.diseaseCounts[data.type] = 1;
    } else {
      this.diseaseCounts[data.type]++;
    }
    console.log("Disease (" + _.find(this.diseases, { id: data.type }).name + "): " + this.diseaseCounts[data.type]);
  }
  
  handleOutbreakNotification(data) {
    console.log("Disease Outbreak (" + _.find(this.diseases, { id: data.type }).name + ")");
  }

  publishDiseases(diseaseCounts) {
    // Notify associated DOA
    // TODO: make sent message type a class
    let that = this;
    _.each(diseaseCounts, function (count, type) {
      diseaseUpdatePublisher.send(type, {
        hds: that.id,
        disease: disease.type,
        count: count,
        vectorTimestamp: []
      });
    });
  }
}

let process = new HDS();
process.init();
