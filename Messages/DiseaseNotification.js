class DiseaseNotification {
  constructor(json) {
    json = json || {};
    this.type = json.type || 1;
    this.id = json.id;
    this.timestamp = json.timestamp || Date.now();
    this.vectorTimestamp = json.vectorTimestamp || [];
  }

  toJSON() {
    return {
      type: this.type,
      id: this.id,
      timestamp: this.timestamp,
      vectorTimestamp: this.vectorTimestamp.get()
    };
  }
}

module.exports = DiseaseNotification;
