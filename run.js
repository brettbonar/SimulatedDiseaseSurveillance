const { spawn } = require("child_process");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = "./config/influenzaOutbreak.json";
//const CONFIG_PATH = "./config/influenzaOutbreak.json";

let config = require(CONFIG_PATH);
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
let logDir = "./logs";
fs.readdir(logDir, (err, files) => {
  if (err) throw err;

  if (files) {
    for (const file of files) {
      fs.unlink(path.join(logDir, file), err => {
        if (err) throw err;
      });
    }
  }
});

// Launch coordinator
launch("node", ["./startProcess.js", "--type", "coordinator", "--configuration", CONFIG_PATH]);

function startProcess(id, type) {
  launch("node",  ["./startProcess.js", "--id", id, "--type", type, "--coordinator-ip", "localhost", "--coordinator-port", "12000"]);
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
