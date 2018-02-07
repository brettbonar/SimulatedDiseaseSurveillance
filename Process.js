const _ = require("lodash");

const logger = require("./logger");
const Req = require("./Messaging/Req");
const VectorTimestamp = require("./Messaging/VectorTimestamp");

class Process {
  constructor(options) {
    this.type = options.type;
    this.id = options.id;
    this.coordinator = {
      ip: options.coordinatorIp,
      port: options.coordinatorPort
    };
    this.name = _.upperCase(this.type) + this.id;
    this.logger = logger.getLogger(this.name);
    this.vectorTimestamp = new VectorTimestamp(this.id);

    // Get configuration from coordinator first
    let sock = new Req(this.coordinator);
    let params = {
      id: this.id,
      type: this.type
    };
    sock.on((data) => this.handleConfig(data));
    sock.send(params);
  }
  
  start(params) {
    _.noop();
  }
  
  handleConfig(config) {
    this.logger.debug("Got config: " + JSON.stringify(config, null, 2));
    this.vectorTimestamp.init(_.map(config.processes, "id"));
    this.start(config);
  }
}

module.exports = Process;
