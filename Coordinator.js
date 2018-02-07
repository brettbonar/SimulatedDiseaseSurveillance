const _ = require("lodash");
const options = require("commander");
const Router = require("./Messaging/Router");
const logger = require("./logger");

class Coordinator {
  constructor(options) {
    this.config = require(options.configuration);
    this.socket = new Router(this.config.coordinator);
    this.logger = logger.getLogger("Coordinator");
    this.socket.on((data, id) => {
      this.logger.debug("Sent config to: " + data.type + data.id);
      this.socket.send(this.getConfig(data), id);
    });
  }

  getConfig(data) {
    let config = this.config;
    let processes = _.concat(config.doa, config.emr, config.hds);
    if (data.type === "emr") {
      let hdsId = _.find(config.emr, { id: data.id }).hds;
      let hds = _.find(config.hds, { id: hdsId });
      return {
        hds: hds,
        processes: processes,
        simulation: config.simulation
      };
    } else if (data.type === "hds") {
      let hds = _.find(config.hds, { id: data.id });
      return {
        hds: hds,
        doa: config.doa,
        processes: processes,
        simulation: config.simulation
      };
    } else if (data.type === "doa") {
      let doa = _.find(config.doa, { id: data.id });
      return {
        doa: doa,
        hds: config.hds,
        processes: processes,
        simulation: config.simulation
      };
    }

    return config;
  }
}

module.exports = Coordinator;
