import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import "./FileViewer.css";
import DocumentDisplay from "../DocumentDisplay/DocumentDisplay";
import TagUploader from "../../Containers/TagManagement/TagUploader";

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.fileReader = new FileReader();
    this.fileData = {};
  }

  openExplorer = () => {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  };

  readFile = file => {
    // reset store if user changes file
    this.props.setAnnotations([]);
    this.props.setAnnotationFocus("NA");
    this.props.setFileText("");
    this.props.setSpacyLoading(true);
    this.props.setSections([]);
    this.props.setSentences([]);
    this.props.setTokens([]);
    this.props.setEntities([]);

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
      let text = this.fileReader.result.replace(/\r\n/g, "\n"); // Replaces /r/n with /n for Windows OS
      this.fileData.content = text;

      const options = {
        method: "POST",
        body: this.fileData
      };

      APIUtility.API.makeAPICall(APIUtility.UPLOAD_DOCUMENT, null, options)
        .then(response => response.json())
        .then(data => {
          console.log("DATA", data);

          const sections = this.props.sections;
          const sentences = this.props.sentences;
          const tokens = this.props.tokens;
          const entities = this.props.entities;

          this.props.setSections(sections.concat(this.mapData(data.sections)));
          this.props.setSentences(sentences.concat(this.mapData(data.sentences)));
          this.props.setTokens(tokens.concat(this.mapData(data.tokens)));
          this.props.setEntities(entities.concat(this.mapData(data.entities)));

          this.props.setSpacyLoading(false);
          this.props.setFileText(text);
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    };
  };

  mapData = dataType => {
    dataType.map(dataPoint => {
      dataPoint.tag = dataPoint.label;
      delete dataPoint.label;
      dataPoint.color = undefined;
      dataPoint.text = this.props.textToDisplay.slice(dataPoint.start, dataPoint.end);
    });
    return dataType;
  };

  render() {
    return (
      <div>
        <div>
          <TagUploader />
        </div>
        <div className="fileUpload">
          <Button onClick={this.openExplorer} variant="contained" color="primary">
            Browse for File
          </Button>
          <input
            ref={this.fileInputRef}
            className="file-input"
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
    textToDisplay: state.fileViewer.fileViewerText,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    // icdCodes:
    spacyLoading: state.fileViewer.spacyLoading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setFileText: text => dispatch(actions.setFileText(text)),
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    // setICDCodes: icdCodes => dispatch
    setSpacyLoading: spacyLoading => dispatch(actions.setSpacyLoading(spacyLoading)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileViewer);
