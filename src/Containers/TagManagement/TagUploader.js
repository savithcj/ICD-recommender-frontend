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
      let lines = e.target.result.replace(/\r\n/g, "\n").split("\n"); // Replace /r/n with /n for Windows OS
      const tags = [];
      lines.map(line => {
        const items = line.split(",");
        if (items[0].trim() !== "") {
          tags.push({
            id: items[0].trim(),
            description: items[1] === undefined ? "" : items[1].trim(),
            disable: items[2] === undefined ? false : items[2].trim() === "d"
          });
        }
      });
      props.appendToUploadedTags(tags);
    };

    fileReader.readAsText(files[0]);
  };

  //TODO
  const readTagsFromStrings = lines => {};

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
