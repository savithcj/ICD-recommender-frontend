import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as util from "./utility";

import IntervalTree from "@flatten-js/interval-tree";

class CustomAnnotator extends Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
  }

  componentDidMount() {
    this.props.setLinkedListAdd(false);
    this.rootRef.current.addEventListener("mouseup", this.handleMouseUp);
    document.onkeypress = e => {
      this.handleKeyPress(e);
    };
  }

  componentWillUnmount() {
    this.rootRef.current.removeEventListener("mouseup", this.handleMouseUp);
    this.props.setLinkedListAdd(false);
  }

  handleKeyPress = e => {
    let key = e.key;
    if (key.toLowerCase() === "a" && this.prevSpan) {
      this.props.setLinkedListAdd(true);
    } else {
      this.props.setLinkedListAdd(false);
    }
  };

  handleMouseUp = () => {
    // if method to handle annotation isn't passed, return
    if (!this.props.onChange) {
      return;
    }

    // can't set a section or entity annotation without a tag
    if (
      (this.props.annotationFocus === "Entity" || this.props.annotationFocus === "Section") &&
      this.props.tag === ""
    ) {
      return;
    }

    const selection = window.getSelection();

    // if there is no selection
    if (util.selectionIsEmpty(selection)) {
      return;
    }

    let start = parseInt(selection.anchorNode.parentElement.getAttribute("data-start"), 10) + selection.anchorOffset;
    let end = parseInt(selection.focusNode.parentElement.getAttribute("data-start"), 10) + selection.focusOffset;

    // if part of a tag is start or end of selection
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return;
    }

    if (util.selectionIsBackwards(selection)) {
      [start, end] = [end, start];
    }

    const span = this.getSpan({ start, end, text: this.props.textToDisplay.slice(start, end) });

    if (this.props.linkedListAdd) {
      this.prevSpan.next = span;
      this.props.setLinkedListAdd(false);
    }

    this.props.onChange([...this.props.annotations, span]);

    this.prevSpan = span;

    // clears selection
    window.getSelection().empty();
  };

  // method to remove an annotation
  handleSplitClick = ({ start, end }) => {
    const splitIndex = this.props.annotations.findIndex(s => s.start === start && s.end === end);
    if (splitIndex >= 0) {
      this.props.onChange([
        ...this.props.annotations.slice(0, splitIndex),
        ...this.props.annotations.slice(splitIndex + 1)
      ]);
    }
  };

  getSpan = span => {
    if (this.props.getSpan) {
      return this.props.getSpan(span);
    }
    return span;
  };

  // testTree() {
  //   let tree = new IntervalTree();
  //   const composers = [
  //     { name: "AAA", period: [1770, 1827] },
  //     { name: "AAA", period: [1685, 1750] },
  //     { name: "Wolfgang Amadeus Mozart", period: [1756, 1791] },
  //     { name: "Johannes Brahms", period: [1833, 1897] },
  //     { name: "Richard Wagner", period: [1813, 1883] },
  //     { name: "Claude Debussy", period: [1862, 1918] },
  //     { name: "Pyotr Ilyich Tchaikovsky", period: [1840, 1893] },
  //     { name: "Frédéric Chopin", period: [1810, 1849] },
  //     { name: "Joseph Haydn", period: [1732, 1809] },
  //     { name: "AAA", period: [1678, 1741] }
  //   ];
  //   for (let composer of composers) {
  //     tree.insert(composer.period, composer.name);
  //   }

  //   const searchRes = tree.search([1600, 1700], (name, period) => {
  //     return `${name} (${period.low}-${period.high})`;
  //   });

  //   console.log(searchRes);
  // }

  render() {
    // this.testTree();
    // const splits = util.splitWithOffsets(this.props.textToDisplay, this.props.annotations);
    const splits = util.createIntervals(this.props.textToDisplay, this.props.annotations);
    console.log("splits", splits);
    return (
      <div>
        <div style={this.props.style} ref={this.rootRef}>
          {splits.map(split => (
            <util.Split key={`${split.start}-${split.end}`} {...split} onClick={this.handleSplitClick} />
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    //   fileReference: state.fileViewer.fileReference,
    //   sections: state.fileViewer.sections,
    //   sentences: state.fileViewer.sentences,
    //   tokens: state.fileViewer.tokens,
    //   entities: state.fileViewer.entities,
    annotations: state.fileViewer.annotations,
    annotationFocus: state.fileViewer.annotationFocus,
    tag: state.fileViewer.tag,
    textToDisplay: state.fileViewer.fileViewerText,
    linkedListAdd: state.fileViewer.linkedListAdd
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLinkedListAdd: setLinkedListAdd => dispatch(actions.setLinkedListAdd(setLinkedListAdd))
    //   setSections: sections => dispatch(actions.setSections(sections)),
    //   setSentences: sentences => dispatch(actions.setSentences(sentences)),
    //   setTokens: tokens => dispatch(actions.setTokens(tokens)),
    //   setEntities: entities => dispatch(actions.setEntities(entities)),
    //   // setICDCodes: icdCodes => dispatch
    //   setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    //   setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomAnnotator);
