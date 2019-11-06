import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";

class FileDisplay extends Component {
  constructor(props) {
    super(props);
    this.data = {};
    this.data.sections = [];
    this.data.sentences = [];
    this.data.tokens = [];
    this.data.entities = [];
  }

  render() {
    return (
      <div className="fileDisplay">
        <p>put file here</p>
      </div>
    );
  }
}

export default connect(
  null,
  null
)(FileDisplay);
