let options = require("commander");
let Req = require("./Messaging/Req");

// TODO: make one launching process that takes "type" command line parameter and creates an instance of that type
class Process {
  constructor(type) {
    this.type = type;
  }
  
  start(params) {
    _.noop();
  }
  
  handleConfig(params) {
    this.diseases = params.diseases;
    console.log("Got config");
    this.start(params);
  }

  init() {
    options
      .option("-i, --id <n>", "Process ID", parseInt)
      .option("-c, --configuration <f>", "Configuration file path")
      .parse(process.argv);

    this.coordinator = require(options.configuration).coordinator;
    this.id = options.id;

    // Get configuration from coordinator first
    let sock = new Req(this.coordinator);
    let params = {
      id: this.id,
      type: this.type
    };
    sock.send(params).then((params) => this.handleConfig(params));
  }
}

module.exports = Process;
