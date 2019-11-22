import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as tagTypes from "./tagTypes";
import Autocomplete from "@material-ui/lab/AutoComplete";
import { TextField, createMuiTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { green, red } from "@material-ui/core/colors";

const theme = createMuiTheme({
  pallete: {
    primary: green,
    secondary: red
  }
});

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    width: "100%",
    borderRadius: "5px",
    overflow: "auto",
    backgroundColor: "inherit",
    flexGrow: 1
  },
  radioButtonForm: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(0)
  },
  searchBox: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  searchBoxText: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginBottom: theme.spacing(0)
  }
}));

const TagSelector = props => {
  const classes = useStyles();

  const handleTypeChange = event => {
    let newSelection = event.target.value;
    console.log(newSelection);
    if (newSelection === props.annotationFocus) {
      // unselecting the currently selected value
      newSelection = "";
    }

    props.setAnnotationFocus(newSelection);

    switch (newSelection) {
      case tagTypes.SECTIONS:
        props.setAnnotations(props.sections);
        break;
      case tagTypes.SENTENCES:
        props.setAnnotations(props.sentences);
        break;
      case tagTypes.ENTITIES:
        props.setAnnotations(props.entities);
        break;
      case tagTypes.TOKENS:
        props.setAnnotations(props.tokens);
        break;
      case tagTypes.ICD_CODES:
        //TODO
        console.log("Not implemented");
        break;
      default:
        console.log("No annotation type selected.");
    }
  };

  const getCurrentTagOptions = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return props.sectionTagsList;

      case tagTypes.ENTITIES:
        return props.entityTagsList;

      case tagTypes.SENTENCES:
        return [];

      case tagTypes.TOKENS:
        return [];

      default:
        return [];
    }
  };

  const getOptionLabelFunc = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return x => x;

      case tagTypes.ENTITIES:
        return x => x.id + ": " + x.description;

      default:
        return x => x;
    }
  };

  const getTextLabel = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return "Search " + tagTypes.SECTIONS;
      case tagTypes.ENTITIES:
        return "Search " + tagTypes.ENTITIES;
      default:
        return "";
    }
  };

  const shouldDisableAutoComplete = () => {
    switch (props.annotationFocus) {
      case tagTypes.SECTIONS:
        return false;
      case tagTypes.ENTITIES:
        return false;
      case tagTypes.SENTENCES:
        return true;
      case tagTypes.TOKENS:
        return true;
      case tagTypes.ICD_CODES:
        return false;
      default:
        return true;
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.radioButtonForm}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Annotation Type</FormLabel>
          <RadioGroup aria-label="type" name="type" value={props.annotationFocus} onChange={handleTypeChange} row>
            <FormControlLabel
              value={tagTypes.SECTIONS}
              control={<Radio />}
              label={tagTypes.SECTIONS}
              labelPlacement="right"
            />
            <FormControlLabel
              value={tagTypes.SENTENCES}
              control={<Radio />}
              label={tagTypes.SENTENCES}
              labelPlacement="right"
            />
            <FormControlLabel
              value={tagTypes.ENTITIES}
              control={<Radio />}
              label={tagTypes.ENTITIES}
              labelPlacement="right"
            />
            <FormControlLabel
              value={tagTypes.TOKENS}
              control={<Radio />}
              label={tagTypes.TOKENS}
              labelPlacement="right"
            />
          </RadioGroup>
        </FormControl>
      </div>
      <div className={classes.searchBox}>
        <Autocomplete
          multiple
          disabled={shouldDisableAutoComplete()}
          filterSelectedOptions
          options={getCurrentTagOptions()}
          //   onChange={}
          getOptionLabel={getOptionLabelFunc()}
          renderInput={params => (
            <TextField
              {...params}
              variant="standard"
              label={getTextLabel()}
              placeholder="Select an annotation type to start"
              margin="normal"
              fullWidth
              className={classes.searchBoxText}
            />
          )}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    annotationFocus: state.fileViewer.annotationFocus, // the currently active type
    tag: state.fileViewer.tag, // the currently active tag
    sections: state.fileViewer.sections,
    sentences: state.fileViewer.sentences,
    tokens: state.fileViewer.tokens,
    entities: state.fileViewer.entities,
    entityTagsList: state.tagManagement.uploadedTags, // a selection of tags for labelling entities
    sectionTagsList: state.fileViewer.sectionList // list of available tags for labelling sections
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTag: tag => dispatch(actions.setTag(tag)),
    setAnnotationFocus: annotationFocus => dispatch(actions.setAnnotationFocus(annotationFocus)),
    setAnnotations: annotations => dispatch(actions.setAnnotations(annotations))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagSelector);
