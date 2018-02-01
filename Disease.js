class Disease {
  constructor(json) {
    json = json || {};
    this.type = json.type || 1;
    this.timestamp = json.timestamp || Date.now();
    // TODO: handle this
    this.vectorTimestamp = json.vectorTimestamp || [];
  }

  toJSON() {
    return {
      type: this.type,
      timestamp: this.timestamp,
      vectorTimestamp: this.vectorTimestamp
    };
  }
}

module.exports = Disease;
