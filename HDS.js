let _ = require("lodash");

let Process = require("./Process");
let Disease = require("./Disease");
let Pull = require("./Messaging/Pull");
let Push = require("./Messaging/Push");

class HDS extends Process {
  constructor() {
    super("hds");
    this.doas = {};
    this.diseaseCounts = {};
  }
  
  start(params) {
    let that = this;

    this.connection = {
      ip: params.hds.ip,
      port: params.hds.port
    };

    _.each(params.doa, function (doa) {
      that.doas[doa.disease] = new Push({ ip: doa.ip, port: doa.port });
    });

    this.puller = new Pull(this.connection);
    this.puller.on((data) => this.handleDiseaseNotification(data));
  }

  handleDiseaseNotification(data) {
    if (_.isUndefined(this.diseaseCounts[data.type])) {
      this.diseaseCounts[data.type] = 1;
    } else {
      this.diseaseCounts[data.type]++;
    }
    console.log("Disease (" + _.find(this.diseases, { id: data.type }).name + "): " + this.diseaseCounts[data.type]);
    // Notify associated DOA
    // TODO: make sent message type a class
    this.doas[data.type].send({
      hds: this.id,
      disease: data.type,
      count: this.diseaseCounts[data.type],
      vectorTimestamp: []
    });
  }
}

let process = new HDS();
process.init();
