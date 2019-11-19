import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import downloader from "../../Util/download";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const ImportExportAnnotations = props => {
  const classes = useStyles();
  const fileInputRef = React.createRef();

  const openExplorer = () => {
    if (props.disabled) {
      return;
    }
    fileInputRef.current.click();
  };

  const readFile = file => {
    let fileReader = new FileReader();

    fileReader.onload = e => {
      const json = JSON.parse(e.target.result);
      props.setSections(json.Section);
      props.setEntities(json.Entity);
      props.setTokens(json.Token);
      props.setSentences(json.Sentence);
      props.setAnnotationFocus("");
      props.setAnnotations([]);
    };

    fileReader.readAsText(file);
  };

  const exportAnnotations = () => {
    let annotations = {};
    annotations.Section = props.sections;
    annotations.Sentence = props.sentences;
    annotations.Entity = props.entities;
    annotations.Token = props.tokens;

    downloader(props.fileReference + "_Annotations.json", JSON.stringify(annotations));
  };

  const importAnnotations = () => {
    openExplorer();
  };

  return (
    <div>
      <div>
        <Button onClick={exportAnnotations} variant="contained" color="primary" className={classes.button}>
          Export Annotations
        </Button>
        <Button onClick={importAnnotations} variant="contained" color="primary" className={classes.button}>
          Import Annotations
        </Button>
        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          //   multiple
          onChange={e => readFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    fileReference: state.fileViewer.fileReference,
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities
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

export default connect(mapStateToProps, mapDispatchToProps)(ImportExportAnnotations);
