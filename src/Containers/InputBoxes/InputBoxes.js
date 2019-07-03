import React from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import { connect } from "react-redux";

import * as actions from "../../Store/Actions/index";

const inputBoxes = props => {
  const handleCodeSelection = enteredCode => {
    props.addSelectedCode(enteredCode);
  };

  const handleAgeSelection = enteredAge => {
    props.setAge(enteredAge);
    props.getRecommendedCodes(props.selectedCodes, enteredAge);
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
      selectAge={handleAgeSelection}
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
    cachedCodeWithDescription: state.cached.cachedCodeWithDescription,
    selectedAge: state.ageGender.selectedAge
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appendCodeToCache: codeObjArray => dispatch(actions.appendToCache(codeObjArray)),
    addSelectedCode: codeToAdd => dispatch(actions.addSelectedCodeAndUpdateRecommendations(codeToAdd)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisksAndUpdateCache(codeObjArray)),
    setAge: ageValue => dispatch(actions.setAge(ageValue))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(inputBoxes);
