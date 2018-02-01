let _ = require("lodash");
let options = require("commander");
let Router = require("./Messaging/Router");

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
      diseases: config.diseases
    };
  } else if (data.type === "hds") {
    // TODO: return DOA list
    let hds = _.find(config.hds, { id: data.id });
    return {
      hds: hds,
      doa: config.doa,
      diseases: config.diseases
    };
  } else if (data.type === "doa") {
    // TODO: return DOA list
    let doa = _.find(config.doa, { id: data.id });
    return {
      doa: doa,
      hds: config.hds,
      diseases: config.diseases
    };
  }

  // TODO: error
  return config;
}

socket.on(function (data, id) {
  console.log("Send config");
  socket.send(getConfig(data), id);
});
