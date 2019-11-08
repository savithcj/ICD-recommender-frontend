import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import "./FileViewer.css";
import DocumentDisplay from "../DocumentDisplay/DocumentDisplay";

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.fileReader = new FileReader();
    this.fileData = {};

    // for testing purposes
    // remove after
    this.data = {};
    this.data.sections = [];
    this.data.sentences = [];
    this.data.tokens = [];
    this.data.entities = [];
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
      this.props.setFileText(this.fileReader.result);

      const options = {
        method: "POST",
        body: this.fileData
      };

      APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
        .then(response => {
          console.log("RESPONSE", response);
          return response.json();
        })
        .then(data => {
          console.log("DATA", data);
        })
        .catch(error => {
          console.log("ERROR:", error);
        });

      console.log(this.fileData);
    };
  };

  render() {
    return (
      <div>
        <div className="fileUpload">
          <Button onClick={this.openExplorer} fullWidth variant="contained" color="primary">
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
        <div>
          <DocumentDisplay />
        </div>
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
)(FileViewer);
