import React, { useState, useEffect, Component } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";

import { TextAnnotator, TokenAnnotator } from "react-text-annotate";

const TAG_COLORS = {
  NEGATION_F: "#44f2ef",
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
    this.state = { value: [], tag: "NEGATION_F" };
  }

  handleTagChange = e => {
    this.setState({ tag: e.target.value });
  };

  handleChange = value => {
    this.setState({ value });
  };

  render() {
    return (
      <div>
        <div>
          <select onChange={this.handleTagChange} value={this.state.tag}>
            <option value="NEGATION_F">Negation forward</option>
            <option value="NEGATION_B">Negation backward</option>
            <option value="NEGATION_BI">Negation bidirectional</option>
            <option value="CLOSURE_BUT">But closure</option>
          </select>
        </div>
        {/* <div>{this.props.textToDisplay}</div> */}
        <div>
          <TokenAnnotator
            style={annoteStyle}
            tokens={this.props.textToDisplay.split(" ")}
            value={this.state.value}
            onChange={this.handleChange}
            getSpan={span => ({
              ...span,
              tag: this.state.tag,
              color: TAG_COLORS[this.state.tag]
            })}
            renderMark={props => (
              <mark key={props.key} onClick={() => props.onClick({ start: props.start, end: props.end })}>
                {props.content} [{props.tag}]
              </mark>
            )}
          />
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
)(DocumentDisplay);
