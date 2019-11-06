import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import "./SelectFile.css";

class SelectFile extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.fileReader = new FileReader();
    this.fileData = {};
  }

  openExplorer = () => {
    console.log("clicked browse for file");
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  };

  readFile = file => {
    this.fileData.id = file.name;
    let ext = file.name.split(".")[file.name.split(".").length - 1];
    if (ext === "txt") {
      this.fileData.format = "plain_text";
    } else if (ext === "rtf") {
      this.fileData.format = "rich_text";
    } else {
      this.fileData.format = "other";
    }
    this.fileReader.readAsText(file);
    this.fileReader.onloadend = () => {
      this.fileData.content = this.fileReader.result;
      console.log(this.fileData);
    };
  };

  render() {
    return (
      <div className="fileUpload">
        <Button
          onClick={this.openExplorer}
          fullWidth
          variant="contained"
          color="primary"
        >
          Browse for File
        </Button>
        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          //   multiple
          onChange={e => this.readFile(e.target.files[0])}
        />
      </div>
    );
  }
}

export default connect(
  null,
  null
)(SelectFile);
