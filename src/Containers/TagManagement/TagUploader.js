import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";

const TagUploader = props => {
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
      let tags = e.target.result.replace(/\r\n/g, "\n").split("\n"); // Replace /r/n with /n for Windows OS
      console.log(tags);
      props.setUploadedTags(tags);
    };

    fileReader.readAsText(files[0]);
  };

  return (
    <div className="fileUpload">
      <Button onClick={openExplorer} variant="contained" color="primary">
        Upload Tags
      </Button>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        onChange={e => readFile(e.target.files)}
      ></input>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    uploadedTags: state.uploadedTags
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUploadedTags: tags => dispatch(actions.setUploadedTags(tags)),
    appendToUploadedTags: tags => dispatch(actions.appendToUploadedTags(tags))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagUploader);
