import React, { useState, useEffect, Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import { TextAnnotator } from "react-text-annotate";

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

class AnnotatorSwitcher extends Component {
  constructor(props) {
    super(props);
  }

  getValues = () => {
    if (this.props.typeToDisplay === "sections") {
      return this.props.sections;
    } else if (this.props.typeToDisplay === "sentences") {
      return this.props.sentences;
    } else if (this.props.typeToDisplay === "tokens") {
      return this.props.tokens;
    } else if (this.props.typeToDisplay === "entities") {
      return this.props.entities;
    } else if (this.props.typeToDisplay === "icdCodes") {
      // implement this
    }
  };

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleAnnotate = annotations => {
    this.setState({ annotations });
    if (this.state.displayType === "Entity") {
      if (this.state.tag !== "") {
        this.props.setEntities(annotations);
      }
    } else if (this.state.displayType === "Section") {
      this.props.setSections(annotations);
    } else if (this.state.displayType === "Sentence") {
      this.props.setSentences(annotations);
    } else if (this.state.displayType === "Token") {
      this.props.setTokens(annotations);
    } else if (this.state.displayType === "ICD Codes") {
      // TO DO: Implement this
      // this.setState({ annotations });
      // this.props.setICDCodes(annotations);
    }
  };

  render() {
    return (
      <TextAnnotator
        style={annoteStyle}
        content={this.props.textToDisplay}
        value={this.getValues}
        onChange={this.handleAnnotate}
        getSpan={span => ({
          ...span,
          tag: this.state.tag,
          color: TAG_COLORS[this.state.tag]
        })}
      />
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
    spacyLoading: state.fileViewer.spacyLoading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSections: sections => dispatch(actions.setSections(sections)),
    setSentences: sentences => dispatch(actions.setSentences(sentences)),
    setTokens: tokens => dispatch(actions.setTokens(tokens)),
    setEntities: entities => dispatch(actions.setEntities(entities))
    // setICDCodes: icdCodes => dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotatorSwitcher);
