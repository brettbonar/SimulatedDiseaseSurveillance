const { spawn } = require("child_process");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const options = require("commander");

function list(val) {
  return val.split(",");
}

options
  .option("-c, --coordinator", "Launch coordinator")
  .option("-config, --configuration <f>", "Configuration file")
  .option("-ids, --ids <items>", "Process IDs to launch from config", list)
  .option("-a, --all", "Start all processes")
  .parse(process.argv);

let configPath = options.configuration || "./config/outbreaks.json";
let config = require(configPath);
let children = [];

function launch(command, args) {
  let child = spawn(command, args);
  child.stdout.on("data", function(data) {
    console.log(data.toString());
  });
  child.stderr.on("data", function(data) {
    console.log(data.toString());
  });
  child.on("close", function(code) {
    console.log("closing code: " + code);
  });
  children.push(child);
}

// Clean log directory
// let logDir = "./logs";
// fs.readdir(logDir, (err, files) => {
//   if (err) throw err;

//   if (files) {
//     for (const file of files) {
//       fs.unlink(path.join(logDir, file), err => {
//         if (err) throw err;
//       });
//     }
//   }
// });

// Launch coordinator
if (options.coordinator) {
  launch("node", ["./startProcess.js", "--type", "coordinator", "--configuration", configPath]);
}

function startProcess(id, type) {
  if (options.all || _.includes(options.ids, id.toString())) {
    launch("node",  ["./startProcess.js", "--id", id, "--type", type, "--coordinator-ip", "localhost", "--coordinator-port", "12000"]);
  }
}

// Launch DOA
_.each(config.doa, function (process) {
  startProcess(process.id, "doa");
});

// Launch EMR
_.each(config.emr, function (process) {
  startProcess(process.id, "emr");
});

// Launch HDS
_.each(config.hds, function (process) {
  startProcess(process.id, "hds");
});
