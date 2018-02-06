const options = require("commander");
const _ = require("lodash");

const logger = require("./logger");
const Req = require("./Messaging/Req");

// TODO: make one launching process that takes "type" command line parameter and creates an instance of that type
class Process {
  constructor(type) {
    this.type = type;
  }
  
  start(params) {
    _.noop();
  }
  
  handleConfig(params) {
    this.logger.debug("Got config: " + JSON.stringify(params));
    this.start(params);
  }

  init() {
    options
      .option("-i, --id <n>", "Process ID", parseInt)
      .option("-c, --configuration <f>", "Configuration file path")
      .parse(process.argv);

    this.id = options.id;
    this.coordinator = require(options.configuration).coordinator;
    this.name = _.upperCase(this.type) + this.id;
    this.logger = logger.getLogger(this.name);

    // Get configuration from coordinator first
    let sock = new Req(this.coordinator);
    let params = {
      id: this.id,
      type: this.type
    };
    sock.on((data) => this.handleConfig(data));
    sock.send(params);//.then((config) => this.handleConfig(config));
  }
}

module.exports = Process;
