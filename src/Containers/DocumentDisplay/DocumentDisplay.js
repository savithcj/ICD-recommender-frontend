import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import { TextAnnotator } from "react-text-annotate";
import "./DocumentDisplay.css";

const TAG_COLORS = {
  neg_f: "rgb(255, 0, 0)",
  NEGATION_B: "#88f7af",
  NEGATION_BI: "#9df283",
  CLOSURE_BUT: "#f277c3",
  SECTION: "#7d8c81",
  SENTENCE: "#9bacde",
  TOKEN: "#dedd9b"
};

const annoteStyle = {
  // fontFamily: "IBM Plex Sans",
  // maxWidth: 500,
  // lineHeight: 1.5
};

class DocumentDisplay extends Component {
  constructor(props) {
    super(props);
    this.tag = "";
    // this.section = "";

    // APIUtility.API.makeAPICall(APIUtility.GET_SECTIONS)
    //   .then(response => response.json())
    //   .then(parsedJson => {
    //     this.sectionList = parsedJson;

    //     const sectionColormap = require("colormap");
    //     this.colors = sectionColormap({
    //       colormap: "hsv",
    //       nshades: this.sectionList.length,
    //       format: "hex",
    //       alpha: 0.8
    //     });
    //     console.log(this.colors);
    //   });
  }

  handleTagChange = e => {
    this.tag = e.target.value;
  };

  // handleSectionChange = e => {
  //   this.section = e.target.value;
  // };

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleAnnotate = annotations => {
    //this.props.setAnnotations(annotations);
    if (this.props.annotationFocus === "Entity") {
      if (this.tag !== "") {
        this.props.setAnnotations(annotations);
        this.props.setEntities(annotations);
      }
    } else if (this.props.annotationFocus === "Section") {
      // if (this.section !== "") {
      this.props.setAnnotations(annotations);
      this.props.setSections(annotations);
      // }
    } else if (this.props.annotationFocus === "Sentence") {
      this.props.setAnnotations(annotations);
      this.props.setSentences(annotations);
    } else if (this.props.annotationFocus === "Token") {
      this.props.setAnnotations(annotations);
      this.props.setTokens(annotations);
    } else if (this.props.annotationFocus === "ICD Codes") {
      // TO DO: Implement this
      // this.setState({ annotations });
      // this.props.setICDCodes(annotations);
    }
  };

  handleTypeChange = e => {
    this.tag = ""; // prevents entity tags from being assigned to sections etc
    // this.section = "";
    this.props.setAnnotationFocus(e.target.value);
    if (e.target.value === "Entity") {
      this.props.setAnnotations(this.props.entities);
    } else if (e.target.value === "Section") {
      this.props.setAnnotations(this.props.sections);
    } else if (e.target.value === "Sentence") {
      this.props.setAnnotations(this.props.sentences);
    } else if (e.target.value === "Token") {
      this.props.setAnnotations(this.props.tokens);
    } else if (e.target.value === "ICD Codes") {
      // implement this
    }
  };

  displayTypeDropDown = () => {
    if (!this.props.spacyLoading && this.props.textToDisplay !== "") {
      return (
        <select
          onChange={this.handleTypeChange}
          value={this.props.annotationFocus && !this.props.spacyLoading ? this.props.annotationFocus : "NA"}
        >
          <option disabled value="NA">
            Select Display Type
          </option>
          <option value="Entity">Entity</option>
          <option value="Section">Section</option>
          <option value="Sentence">Sentence</option>
          <option value="Token">Token</option>
          <option value="ICD Codes">ICD Codes</option>
        </select>
      );
    } else if (!this.props.spacyLoading && this.props.textToDisplay === "") {
      // do nothing
    } else {
      return <LoadingIndicator />;
    }
  };

  entityTagDropDown = () => {
    if (
      !this.props.spacyLoading &&
      this.props.textToDisplay !== "" // &&
      // (this.props.annotationFocus === "Entity" || this.props.annotationFocus === "Section")
    ) {
      return (
        <select onChange={this.handleTagChange} value={this.tag ? this.tag : "NA"}>
          <option disabled value="NA">
            Select a tag
          </option>
          {this.props.tags.map(tag => (
            <option value={tag.id} key={tag.id}>
              {tag.description}
            </option>
          ))}
        </select>
      );
    }
  };

  // sectionTagDropDown = () => {
  //   if (!this.props.spacyLoading && this.props.textToDisplay !== "" && this.props.annotationFocus === "Section") {
  //     return (
  //       // <select onChange={this.handleSectionChange} value={this.section ? this.section : "NA"}>
  //       <select onChange={this.handleTagChange} value={this.tag ? this.tag : "NA"}>
  //         <option disabled value="NA">
  //           Select a tag
  //         </option>
  //         {this.sectionList.map(section => (
  //           <option value={section} key={section}>
  //             {section}
  //           </option>
  //         ))}
  //       </select>
  //     );
  //   }
  // };

  renderAnnotator = () => {
    return (
      <TextAnnotator
        style={annoteStyle}
        content={this.props.textToDisplay}
        value={this.props.annotations}
        onChange={this.handleAnnotate}
        getSpan={span => ({
          ...span,
          tag: this.tag,
          color: TAG_COLORS[this.tag]
        })}
      />
    );
  };

  render() {
    return (
      <div>
        <div>
          {this.displayTypeDropDown()}
          {this.entityTagDropDown()}
          {/* {this.sectionTagDropDown()} */}
        </div>
        <div>{this.renderAnnotator()}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    textToDisplay: state.fileViewer.fileViewerText,
    tags: state.tagManagement.uploadedTags,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    // icdCodes:
    spacyLoading: state.fileViewer.spacyLoading,
    annotationFocus: state.fileViewer.annotationFocus,
    annotations: state.fileViewer.annotations
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities)),
    // setICDCodes: icdCodes => dispatch
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentDisplay);
