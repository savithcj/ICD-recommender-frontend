import React, { useState, useEffect, Component } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";

class DocumentDisplay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>{this.props.textToDisplay}</p>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    textToDisplay: state.fileViewer.fileViewerText
    // something with the sections/sentences etc
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setFileText: text => dispatch(actions.setFileText(text))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentDisplay);
