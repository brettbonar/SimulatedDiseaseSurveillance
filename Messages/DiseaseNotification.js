class DiseaseNotification {
  constructor(json) {
    json = json || {};
    this.type = json.type || 1;
    this.timestamp = json.timestamp || Date.now();
    this.vectorTimestamp = json.vectorTimestamp || [];
  }

  toJSON() {
    return {
      type: this.type,
      timestamp: this.timestamp,
      vectorTimestamp: this.vectorTimestamp.get()
    };
  }
}

module.exports = DiseaseNotification;
