const options = require("commander");
const _ = require("lodash");

const logger = require("./logger");
const Req = require("./Messaging/Req");

class Process {
  constructor(type) {
    this.type = type;
  }
  
  start(params) {
    _.noop();
  }
  
  handleConfig(config) {
    this.logger.debug("Got config: " + JSON.stringify(config, null, 2));
    this.initializeVectorTimestamp(config);
    this.start(config);
  }

  init() {
    options
      .option("-i, --id <n>", "Process ID", parseInt)
      .option("-cip, --coordinator-ip <f>", "Coordinator IP address")
      .option("-cport, --coordinator-port <f>", "Coordinator port")
      .parse(process.argv);

    this.id = options.id;
    this.coordinator = {
      ip: options.coordinatorIp,
      port: options.coordinatorPort
    };
    this.name = _.upperCase(this.type) + this.id;
    this.logger = logger.getLogger(this.name);
    this.vectorTimestamp = { [this.id]: 0 };

    // Get configuration from coordinator first
    let sock = new Req(this.coordinator);
    let params = {
      id: this.id,
      type: this.type
    };
    sock.on((data) => this.handleConfig(data));
    sock.send(params);
  }

  initializeVectorTimestamp(config) {
    _.each(config.processes, (process) => {
      this.vectorTimestamp[process.id] = 0;
    });
  }

  updateVectorTimestamp(vectorTimestamp) {
    if (vectorTimestamp) {
      _.each(vectorTimestamp, (time, processId) => {
        this.vectorTimestamp[processId] = Math.max(this.vectorTimestamp[processId], time);
      });
    }
    this.vectorTimestamp[this.id] += 1;
    this.logger.debug("Vector timestamp: " + JSON.stringify(this.vectorTimestamp, null, 2));
  }
}

module.exports = Process;
