const _ = require("lodash");
const options = require("commander");
const Router = require("./Messaging/Router");
const logger = require("./logger").getLogger("Coordinator");

options
  //.version("0.1.0")
  .option("-c, --configuration <f>", "Configuration file path")
  .parse(process.argv);

let config = require(options.configuration);
let socket = new Router(config.coordinator);

function getConfig(data) {
  if (data.type === "emr") {
    let hdsId = _.find(config.emr, { id: data.id }).hds;
    let hds = _.find(config.hds, { id: hdsId });
    return {
      hds: hds,
      simulation: config.simulation
    };
  } else if (data.type === "hds") {
    let hds = _.find(config.hds, { id: data.id });
    return {
      hds: hds,
      doa: config.doa,
      simulation: config.simulation
    };
  } else if (data.type === "doa") {
    let doa = _.find(config.doa, { id: data.id });
    return {
      doa: doa,
      hds: config.hds,
      simulation: config.simulation
    };
  }

  // TODO: error
  return config;
}

socket.on(function (data, id) {
  logger.debug("Sent config to: " + data.type + data.id);
  socket.send(getConfig(data), id);
});
