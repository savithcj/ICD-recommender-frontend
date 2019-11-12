import React, { useState, useEffect, Component } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";

import { TextAnnotator, TokenAnnotator } from "react-text-annotate";

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
    this.state = { annotations: [], tag: "", displayType: "Entity" };
  }

  handleTagChange = e => {
    this.setState({ tag: e.target.value });
  };

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleChange = annotations => {
    console.log("selected something");
    if (this.state.displayType === "Entity") {
      if (this.state.tag !== "") {
        this.setState({ annotations });
        this.props.setEntities(annotations);
        console.log("entity value", annotations);
      }
    } else if (this.state.displayType === "Section") {
      this.setState({ annotations });
      this.props.setSections(annotations);
      console.log("section value", annotations);
    } else if (this.state.displayType === "Sentence") {
      this.setState({ annotations });
      this.props.setSentences(annotations);
      console.log("sentence value", annotations);
    } else if (this.state.displayType === "Token") {
      this.setState({ annotations });
      this.props.setTokens(annotations);
      console.log("token value", annotations);
    } else if (this.state.displayType === "ICD Codes") {
      // TO DO: Implement this
      // this.setState({ annotations });
      // this.setICDCodes(annotations);
    }
  };

  handleTypeChange = e => {
    this.state.tag = "";
    this.setState({ displayType: e.target.value });
    if (e.target.value === "Entity") {
      this.setState({ annotations: this.props.entities });
    } else if (e.target.value === "Section") {
      this.setState({ annotations: this.props.sections });
    } else if (e.target.value === "Sentence") {
      this.setState({ annotations: this.props.sentences });
    } else if (e.target.value === "Token") {
      this.setState({ annotations: this.props.tokens });
    } else if (e.target.value === "ICD Codes") {
      // implement this
    }
  };

  render() {
    return (
      <div>
        <div>
          <select onChange={this.handleTypeChange} value={this.state.displayType}>
            <option value="Entity">Entity</option>
            <option value="Section">Section</option>
            <option value="Sentence">Sentence</option>
            <option value="Token">Token</option>
            <option value="ICD Codes">ICD Codes</option>
          </select>

          <select
            onChange={this.handleTagChange}
            value={this.state.tag && this.state.displayType === "Entity" ? this.state.tag : "NA"}
          >
            <option disabled value="NA">
              Select a tag
            </option>
            {this.props.tags.map(tag => (
              <option value={tag} key={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
        <div>
          <TextAnnotator
            style={annoteStyle}
            content={this.props.textToDisplay}
            value={this.state.annotations}
            onChange={this.handleChange}
            getSpan={span => ({
              ...span,
              tag: this.state.tag,
              color: TAG_COLORS[this.state.tag]
            })}
          />
        </div>
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
    entities: state.fileViewer.entities
    // icdCodes:
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
)(DocumentDisplay);
