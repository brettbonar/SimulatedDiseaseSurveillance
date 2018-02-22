const _ = require("lodash");
const q = require("q");

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
    this.name = this.id;
    this.logger = logger.getLogger(this.name);
    this.vectorTimestamp = new VectorTimestamp(this.id);

    // Get configuration from coordinator first
    let sock = new Req(this.coordinator);
    let params = {
      id: this.id,
      msgType: "requestConfiguration"
    };
    sock.on((data) => this.handleConfig(data));
    sock.send(params);
  }

  requestName(name) {
    let deferred = q.defer();
    let req = new Req(this.coordinator);
    req.on((data) => deferred.resolve(data));
    req.send({
      name: name,
      msgType: "requestName"
    });
    
    return deferred.promise;
  }

  ready(config) {
    let req = new Req(this.coordinator);
    req.send({
      msgType: "ready",
      id: this.id
    });
    req.on((data) => {
      this.start(config);
    });
  }
  
  handleConfig(config) {
    // TODO: clean this up
    this.logger.debug("Got config: " + JSON.stringify(config, null, 2));
    let left = _.size(config.bindings);
    _.each(config.bindings, (binding, name) => {
      let req = new Req(this.coordinator);
      this.logger.debug("Register Binding:" + name);
      req.send({
        msgType: "register",
        name: [this.id, name].join("."),
        binding: binding,
        type: this.type
      });
      req.on((data) => {
        this.logger.debug("Registered: " + name);
        left -= 1;
        if (left === 0) {
          this.logger.debug("Ready");
          this.ready(config);
        }
      });
    });

    if (_.size(config.bindings) === 0) {
      this.ready(config);
    }
  }
}

module.exports = Process;
