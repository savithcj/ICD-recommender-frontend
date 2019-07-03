import React from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import { connect } from "react-redux";

import * as actions from "../../Store/Actions/index";

const inputBoxes = props => {
  const handleCodeSelection = enteredCode => {
    const selectedCodes = Array.from(props.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === enteredCode);

    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(props.cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === enteredCode);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };

      selectedCodes.push(newCode);
      props.addSelectedCode(newCode);

      props.getRecommendedCodes(selectedCodes, props.selectedAge);
      props.getDaggerAsterisks(selectedCodes);
    } else {
      console.log("[InputBoxes Container] error: trying to add duplicate code =>", enteredCode);
    }
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
    selectedAge: state.inputBoxes.selectedAge
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appendCodeToCache: codeObjArray => dispatch(actions.appendToCache(codeObjArray)),
    addSelectedCode: codeToAdd => dispatch(actions.addSelectedCode(codeToAdd)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendations(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisks(codeObjArray)),
    setAge: ageValue => dispatch(actions.setAge(ageValue))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(inputBoxes);
