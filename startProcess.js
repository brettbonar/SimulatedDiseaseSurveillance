const options = require("commander");

const Coordinator = require("./Coordinator");
const DOA = require("./DOA");
const EMR = require("./EMR");
const HDS = require("./HDS");

options
  .option("-c, --configuration <f>", "Configuration file path")
  .option("-i, --id <n>", "Process ID", parseInt)
  .option("-t, --type <s>", "Process type")
  .option("-cip, --coordinator-ip <f>", "Coordinator IP address")
  .option("-cport, --coordinator-port <f>", "Coordinator port")
  .parse(process.argv);

let proc = null;
if (options.type === "coordinator") {
  proc = new Coordinator(options);
} else if (options.type === "doa") {
  proc = new DOA(options);
} else if (options.type === "emr") {
  proc = new EMR(options);
} else if (options.type === "hds") {
  proc = new HDS(options);
}
