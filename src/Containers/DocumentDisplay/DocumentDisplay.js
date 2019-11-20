import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";
import { TextAnnotator } from "react-text-annotate";
import CustomAnnotator from "../../Components/CustomAnnotator/CustomAnnotator";
import "./DocumentDisplay.css";

const annoteStyle = {
  // fontFamily: "IBM Plex Sans",
  // maxWidth: 500,
  // lineHeight: 1.5
};

class DocumentDisplay extends Component {
  constructor(props) {
    super(props);
    this.props.setTag("");
  }

  handleTagChange = e => {
    this.props.setTag(e.target.value);
  };

  // this is called whenever the user selects something to annotate or clicks on an annotation to remove it
  handleAnnotate = annotations => {
    if (this.props.annotationFocus === "Entity") {
      this.props.setEntities(annotations);
    } else if (this.props.annotationFocus === "Section") {
      this.props.setSections(annotations);
    } else if (this.props.annotationFocus === "Sentence") {
      // sorting sentences in order to have alternating sentences in different colors
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      for (let i = 0; i < annotations.length; i++) {
        if (i % 2 === 0) {
          annotations[i].color = this.props.alternatingColors[0];
        } else {
          annotations[i].color = this.props.alternatingColors[1];
        }
      }
      this.props.setSentences(annotations);
    } else if (this.props.annotationFocus === "Token") {
      annotations = annotations.sort((a, b) => {
        return a.start - b.start;
      });
      for (let i = 0; i < annotations.length; i++) {
        if (i % 2 === 0) {
          annotations[i].color = this.props.alternatingColors[0];
        } else {
          annotations[i].color = this.props.alternatingColors[1];
        }
      }
      this.props.setTokens(annotations);
    } else if (this.props.annotationFocus === "ICD Codes") {
      // TO DO: Implement this
      // this.setState({ annotations });
      // this.props.setICDCodes(annotations);
    }
    this.props.setAnnotations(annotations);
    console.log("prop.annot", this.props.annotations);
  };

  handleTypeChange = e => {
    this.props.setTag(""); // prevents entity tags from being assigned to sections etc
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
    if (!this.props.spacyLoading && this.props.textToDisplay !== "" && this.props.annotationFocus === "Entity") {
      return (
        <select onChange={this.handleTagChange} value={this.props.tag ? this.props.tag : "NA"}>
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

  sectionTagDropDown = () => {
    if (!this.props.spacyLoading && this.props.textToDisplay !== "" && this.props.annotationFocus === "Section") {
      return (
        <select onChange={this.handleTagChange} value={this.props.tag ? this.props.tag : "NA"}>
          <option disabled value="NA">
            Select a tag
          </option>
          {this.props.sectionList.map(section => (
            <option value={section} key={section}>
              {section}
            </option>
          ))}
        </select>
      );
    }
  };

  renderAnnotator = () => {
    return (
      <TextAnnotator
        style={annoteStyle}
        content={this.props.textToDisplay}
        value={this.props.annotations}
        onChange={this.handleAnnotate}
        getSpan={span => ({
          ...span,
          tag: this.props.tag,
          color: this.props.tagColors[this.props.tag]
        })}
      />
    );
  };

  handleChange = value => {
    this.props.setAnnotations(value);
  };

  renderCustomAnnotator = () => {
    return (
      <CustomAnnotator
        style={annoteStyle}
        onChange={this.handleAnnotate}
        getSpan={span => ({
          ...span,
          tag: this.props.tag,
          color: this.props.tagColors[this.props.tag]
        })}
      />
    );
  };

  render() {
    return (
      <div>
        {/* <div>
          <h1 qwerty="some random text">some random text</h1>
        </div> */}
        <div>
          {this.displayTypeDropDown()}
          {this.entityTagDropDown()}
          {this.sectionTagDropDown()}
        </div>
        {/* <div id="whiteSpace">{this.renderAnnotator()}</div> */}
        <div id="whiteSpace">{this.renderCustomAnnotator()}</div>
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
    annotations: state.fileViewer.annotations,
    tagColors: state.fileViewer.tagColors,
    sectionList: state.fileViewer.sectionList,
    tag: state.fileViewer.tag,
    alternatingColors: state.fileViewer.alternatingColors
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
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations)),
    setTag: tag => dispatch(actions.setTag(tag))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentDisplay);
