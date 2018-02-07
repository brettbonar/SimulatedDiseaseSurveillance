const chai = require("chai");
const mocha = require("mocha");
const sinon = require("sinon");
const expect = chai.expect;

const Pub = require("../../Messaging/Pub");
const Sub = require("../../Messaging/Sub");

describe("Pub-Sub", function () {
  const CONNECTION = { ip: "localhost", port: 12000 };
  const MESSAGE = { "Test": "This is a test" };
  const TOPIC_A = "A";

  it("Publishes and Subscribes", function (done) {
    let pub = new Pub(CONNECTION);
    let sub = new Sub(CONNECTION, TOPIC_A);

    sub.on(function (data) {
      expect(data).to.eql(MESSAGE);
      pub.close();
      sub.close();
      done();
    });
    
    pub.send(MESSAGE, TOPIC_A);
  })
});
