import React from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import { connect } from "react-redux";

import * as actions from "../../Store/Actions/index";

const inputBoxes = props => {
  const handleCodeSelection = newCodeObj => {
    props.addSelectedCodes(newCodeObj);
  };

  return (
    <CodeInputField
      id_code="input1"
      id_age="input2"
      id_gender="input3"
      placeholder_code="Search for a code"
      placeholder_age="Age"
      placeholder_gender="Gender"
      selectCode={handleCodeSelection}
      // selectAge={handleAgeSelection}
      // selectGender={handleGenderSelection}
      codeCache={props.cachedCodeWithDescription}
      appendCodeToCache={props.appendCodeToCache}
      autoClearCode={true}
      width_code="72%"
      width_age="10%"
      width_gender="15%"
    />
  );
};

const mapStateToProps = state => {
  return {
    selectedCodes: state.selected.selectedCodes,
    cachedCodeWithDescription: state.cached.cachedCodeWithDescription
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appendCodeToCache: codeObjArray => dispatch(actions.appendToCache(codeObjArray)),
    addSelectedCodes: codeToAdd => dispatch(actions.addSelectedCode(codeToAdd)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(inputBoxes);
