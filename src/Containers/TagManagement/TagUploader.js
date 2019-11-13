import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import { useAlert, positions } from "react-alert";

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
      let tags = readTagsFromStrings(lines);
      console.log(tags);
      props.setUploadedTags(tags);
    };

    fileReader.readAsText(files[0]);
  };

  const readTagsFromStrings = lines => {
    const oldTags = Array.from(props.uploadedTags);
    const newTags = [];
    const descriptionUpdated = []; // Keeps track of duplicate tags id with description update
    const newEnabled = []; // Keeps track of disabled flags being changed to false
    const newDisabled = []; // keep track of disabled flags being changed to true

    for (let i = 0; i < lines.length; i++) {
      const items = lines[i].split(",");

      const id = items[0];
      let description = items[1];
      let disabled = items[2];

      if (description !== undefined) {
        description = description.trim();
      } else {
        description = "";
      }

      if (disabled !== undefined) {
        disabled = disabled.trim() === "d";
      } else {
        disabled = false;
      }

      if (id !== "") {
        // line is not empty

        let duplicateTag = oldTags.find(tag => tag.id === id);

        if (duplicateTag !== undefined) {
          // tag id already exist in oldTags

          if (description !== duplicateTag.description) {
            // description update
            duplicateTag.description = description;
            descriptionUpdated.push(duplicateTag);
          }

          if (disabled !== duplicateTag.disabled) {
            // disabled boolean update
            duplicateTag.disabled = disabled;
            if (duplicateTag.disabled) {
              newDisabled.push(duplicateTag);
            } else {
              newEnabled.push(duplicateTag);
            }
          }
        } else {
          // the tag does not exist in oldTags
          oldTags.push({ id, description, disabled });
          newTags.push({ id, description, disabled });
        }
      }
    }
    generateAlert(descriptionUpdated, newEnabled, newDisabled);
    return oldTags;
  };

  const generateAlert = (descriptionUpdated, newEnabled, newDisabled) => {
    let message = "";
    if (descriptionUpdated.length > 0) {
      message += "The following descriptions have been updated: \n";
      descriptionUpdated.map(
        tag => (message += tag.id + ": " + tag.description + "\n")
      );
    }
    if (newEnabled.length > 0) {
      message += "The following tags have been enabled: \n";
      newEnabled.map(tag => (message += tag.id + "\n"));
    }
    if (newDisabled.length > 0) {
      message += "The following tags have been disabled: \n";
      newDisabled.map(tag => (message += tag.id + "\n"));
    }
    console.log(message);
    props.setAlertMessage({ message: message, messageType: "success" });
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
    uploadedTags: state.tagManagement.uploadedTags
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUploadedTags: tags => dispatch(actions.setUploadedTags(tags)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagUploader);
