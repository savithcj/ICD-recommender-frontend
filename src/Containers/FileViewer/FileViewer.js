import React, { Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import "./FileViewer.css";
import DocumentDisplay from "../DocumentDisplay/DocumentDisplay";
import TagUploader from "../../Containers/TagManagement/TagUploader";
import ImportExportAnnotations from "../../Containers/ImportExportAnnotations/ImportExportAnnotations";

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.fileReader = new FileReader();
    this.fileData = {};

    APIUtility.API.makeAPICall(APIUtility.GET_SECTIONS)
      .then(response => response.json())
      .then(parsedJson => {
        this.props.setSectionList(parsedJson);

        const sectionColormap = require("colormap");
        this.colors = sectionColormap({
          colormap: [
            { index: 0, rgb: [172, 205, 239] },
            { index: 0.1, rgb: [244, 189, 161] },
            { index: 0.2, rgb: [140, 202, 181] },
            { index: 0.3, rgb: [241, 174, 195] },
            { index: 0.4, rgb: [205, 183, 228] },
            { index: 0.5, rgb: [127, 202, 212] },
            { index: 0.6, rgb: [149, 156, 243] },
            { index: 0.7, rgb: [222, 146, 202] },
            { index: 0.8, rgb: [202, 210, 213] },
            { index: 0.9, rgb: [244, 196, 199] },
            { index: 1, rgb: [130, 156, 182] }
          ],
          nshades: this.props.sectionList.length,
          format: "hex",
          alpha: 0.5
        });

        this.TAG_COLORS = {
          neg_f: "rgb(255, 0, 0)",
          NEGATION_B: "#88f7af",
          NEGATION_BI: "#9df283",
          CLOSURE_BUT: "#f277c3",
          SECTION: "#7d8c81",
          SENTENCE: "#9bacde",
          TOKEN: "#dedd9b"
        };

        for (let i = 0; i < this.props.sectionList.length; i++) {
          this.TAG_COLORS[this.props.sectionList[i]] = this.colors[i];
        }

        this.props.setTagColors(this.TAG_COLORS);
      });
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
    let filename = file.name.slice(0, file.name.length - 1 - ext.length);
    this.props.setFileReference(filename);
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
          this.props.setSections(this.mapData(data.sections));
          this.props.setSentences(this.mapData(data.sentences, "color"));
          this.props.setTokens(this.mapData(data.tokens, "color"));
          this.props.setEntities(this.mapData(data.entities));

          this.props.setSpacyLoading(false);
          this.props.setFileText(text);
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    };
  };

  mapData = (data, coloring = "") => {
    let i = 0;
    data.map(dataPoint => {
      dataPoint.tag = dataPoint.label;
      delete dataPoint.label;
      if (coloring === "") {
        dataPoint.color = this.props.tagColors[dataPoint.tag];
      } else if (coloring === "color") {
        if (i % 2 === 0) {
          dataPoint.color = this.props.alternatingColors[0];
        } else {
          dataPoint.color = this.props.alternatingColors[1];
        }
        i += 1;
      }
      dataPoint.text = this.props.textToDisplay.slice(dataPoint.start, dataPoint.end);
    });
    return data;
  };

  render() {
    return (
      <div>
        <div>
          <TagUploader />
        </div>
        <div>
          <ImportExportAnnotations />
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
    spacyLoading: state.fileViewer.spacyLoading,
    tagColors: state.fileViewer.tagColors,
    sectionList: state.fileViewer.sectionList,
    alternatingColors: state.fileViewer.alternatingColors
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
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setTagColors: tagColors => dispatch(actions.setTagColors(tagColors)),
    setSectionList: sectionList => dispatch(actions.setSectionList(sectionList)),
    setFileReference: fileReference => dispatch(actions.setFileReference(fileReference))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
