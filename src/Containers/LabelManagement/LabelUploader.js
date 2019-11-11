import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import { read } from "fs";

const LabelUploader = props => {
  const fileInputRef = React.createRef();

  const openExplorer = () => {
    if (props.disabled) {
      return;
    }
    fileInputRef.current.click();
  };

  const readFile = files => {
    console.log("reading file..");
    let fileReader = new FileReader();

    fileReader.onload = e => {
      let labels = e.target.result.replace(/\r\n/g, "\n").split("\n"); // Replace /r/n with /n for Windows OS
      console.log(labels);
      props.setUploadedLabels(labels);
    };

    fileReader.readAsText(files[0]);
  };

  return (
    <div className="fileUpload">
      <Button onClick={openExplorer} variant="contained" color="primary">
        Upload Labels
      </Button>
      <input ref={fileInputRef} className="file-input" type="file" onChange={e => readFile(e.target.files)}></input>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    uploadedLabels: state.uploadedLabels
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUploadedLabels: labels => dispatch(actions.setUploadedLabels(labels)),
    appendToUploadedLabels: labels => dispatch(actions.appendToUploadedLabels(labels))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelUploader);
