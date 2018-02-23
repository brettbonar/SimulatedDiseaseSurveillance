const _ = require("lodash");
const q = require("q");
const publicIp = require("public-ip");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require("fs");
const tcpPortUsed = require("tcp-port-used");

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

    setInterval(() => this.sendLogs(), 30000);
  }

  sendLogs() {
    var myBucket = 'bbonar-simulated-disease-surveillance';
    var name = this.id + ".log";
    var file = fs.readFileSync("./logs/" + name, "utf8");
  
    let params = { Bucket: myBucket, Key: name, Body: file };
    s3.putObject(params);
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

  getPort(binding, cb) {
    tcpPortUsed.check(binding.port, binding.ip).then((inUse) => {
      if (inUse) {
        this.logger.debug("Port in use: " + binding.port);
        binding.port += 1;
        if (binding.port > 13000) {
          binding.port = 12000;
        }
        getPort(binding, cb);
      } else {
        cb();
      }
    });
  }
  
  handleConfig(config) {
    // TODO: clean this up
    this.logger.debug("Got config: " + JSON.stringify(config, null, 2));
    let left = _.size(config.bindings);

    publicIp.v4().then((ip) => {
      _.each(config.bindings, (binding, name) => {
        getPort(binding, () => {
          let req = new Req(this.coordinator);
          this.logger.debug("Register Binding: " + name);
          req.send({
            msgType: "register",
            name: [this.id, name].join("."),
            binding: {
              ip: ip,
              port: binding.port
            },
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
        })
      });
    });

    if (_.size(config.bindings) === 0) {
      this.ready(config);
    }
  }
}

module.exports = Process;
