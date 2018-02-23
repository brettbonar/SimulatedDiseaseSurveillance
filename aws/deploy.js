// Load the SDK for JavaScript
const AWS = require("aws-sdk");
// Set the region 
AWS.config.update({region: "us-west-2"});
// Use Q implementation of Promise
AWS.config.setPromisesDependency(require("q").Promise);

const { spawn } = require("child_process");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const options = require("commander");
const q = require("q");

const createInstance = require("./createInstance");
const codeDeploy = require("./codeDeploy");
const deployConfig = require("./deployConfig");
const runProcesses = require("./runProcesses");

const ec2 = new AWS.EC2({apiVersion: "2016-11-15"});

function list(val) {
  return val.split(",");
}

options
  .option("-config, --configuration <f>", "Configuration file")
  .option("-s, --single", "Single machine")
  .option("-l, --local", "Local machine")
  .parse(process.argv);

let configPath = options.configuration || "../config/outbreaks.json";
let config = require(configPath);
config.processes = {};
let nextPort = 12001;

function addProcess(process) {
  config.processes[process.id] = process;
  return createInstance(process).then(instanceId => process.instanceId = instanceId);
}

function launchDoa(disease, index) {
  let id = "doa" + index;
  let process = {
    disease: disease,
    id: id,
    type: "doa",
    bindings: {
      notification: {
        ip: "localhost",
        port: nextPort++
      }
    }
  };
  addProcess(process);
}

function launchEmr(hds, hdsIndex, emrIndex) {
  let id = "emr" + hdsIndex + "_" + emrIndex;
  let process = {
    id: id,
    type: "emr",
    hds: hds
  };
  addProcess(process);
}

function launchHds(id) {
  let process = {
    id: id,
    type: "hds",
    bindings: {
      notification: {
        ip: "localhost",
        port: nextPort++
      },
      update: {
        ip: "localhost",
        port: nextPort++
      },
      outbreak: {
        ip: "localhost",
        port: nextPort++
      }        
    }
  };
  addProcess(process);

function launchCoordinator() {
  let process = {
    id: "coordinator",
    type: "coordinator",
    bindings: {
      coordinator: {
        ip: "localhost",
        port: nextPort++
      }
    }
  };
  addProcess(process);
}

function launchSingle() {
  config.simulation.diseases.forEach((disease, index) => launchDoa(disease, index));
  config.hds.forEach((hds, index) => launchHds(hds, index));
}

function launchDistributed() {
  // Create DOAs
  let promises = [];
  promises.push(launchCoordinator());
  _.each(config.simulation.diseases, (disease, index) => {
    promises.push(launchDoa(disease, index));
  });
  _.each(config.hds, (hds, index) => {
    let id = "hds" + index;
    promises.push(launchHds(id));
    for (let i = 0; i < hds.numEmr; i++) {
      promises.push(launchEmr(id, index, i));
    }
  });

  promises.push(deployConfig(config));

  q.all(promises).then(function (instanceIds) {
    console.log("Done creating instances. Start deployment.");
    codeDeploy().then(function () {
      console.log("Code deployment successful");
      runProcesses(config);
    }).catch(function (err) {
      console.log("Code deployment failed:", err);
    });

    // setTimeout(function () {
    //   var params = {
    //     InstanceIds: instanceIds,
    //     DryRun: false
    //   };
    //   ec2.terminateInstances(params, function(err, data) {
    //     if (err) console.log(err, err.stack); // an error occurred
    //     else     console.log(data);           // successful response
    //   });
    // }, 10000)
  }).catch(function () {
    console.log("Failed deploying");
  });
}

launchDistributed();
