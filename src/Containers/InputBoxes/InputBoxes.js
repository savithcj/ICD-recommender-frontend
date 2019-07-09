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
    props.getRecommendedCodes(props.selectedCodes);
  };

  return (
    <div className="home_input_fields">
      <div className="home_code_input">
        <CodeInputField
          id_code="input1"
          placeholder_code="Search for a code"
          placeholder_age="Age"
          placeholder_gender="Gender"
          selectCode={handleCodeSelection}
          codeCache={props.cachedCodeWithDescription}
          appendCodeToCache={props.appendCodeToCache}
          autoClearCode={true}
        />
      </div>
      <div className="home_age_input_div">
        <input type="text" name="Age" placeholder="age" id="home_age_input" />
      </div>
      <div className="home_gender_input_div">
        <input type="text" name="Gender" placeholder="gender" id="home_gender_input" />
      </div>
    </div>
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
    addSelectedCode: codeToAdd => dispatch(actions.addSelectedCodeAndUpdateRecommendations(codeToAdd)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    setAge: ageValue => dispatch(actions.setAge(ageValue))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(inputBoxes);
