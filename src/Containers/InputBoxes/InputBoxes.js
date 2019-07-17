import React from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";

const inputBoxes = props => {
  const handleCodeSelection = enteredCode => {
    // props.addSelectedCode(enteredCode);
    props.setCodeInTree(enteredCode);
    // console.log(enteredCode);
  };

  const handleAgeSelection = () => {
    const age = document.getElementById("home_age_input").value;
    props.setAge(cleanAgeInput(age));
    props.getRecommendedCodes(props.selectedCodes);
  };

  const cleanAgeInput = str => {
    //TODO: Implement input error checking
    return str;
  };

  const handleGenderSelection = () => {
    const gender = document.getElementById("home_gender_input").value;

    if (gender === "Female" || gender === "Male" || gender === "Other") {
      props.setGender(gender);
      props.getRecommendedCodes(props.selectedCodes);
    } else {
      // invalid gender selection
    }
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
        <input
          type="text"
          name="Age"
          placeholder="age"
          id="home_age_input"
          onChange={handleAgeSelection}
          value={props.age ? props.age : ""}
        />
      </div>
      <div className="home_gender_input_div">
        <select id="home_gender_input" onChange={handleGenderSelection} value={props.gender ? props.gender : "NA"}>
          <option disabled value="NA">
            Gender
          </option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    selectedCodes: state.selected.selectedCodes,
    cachedCodeWithDescription: state.cached.cachedCodeWithDescription,
    gender: state.ageGender.selectedGender,
    age: state.ageGender.selectedAge
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appendCodeToCache: codeObjArray => dispatch(actions.appendToCache(codeObjArray)),
    addSelectedCode: codeToAdd => dispatch(actions.addSelectedCodeAndUpdateRecommendations(codeToAdd)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    setAge: ageValue => dispatch(actions.setAge(ageValue)),
    setGender: genderValue => dispatch(actions.setGender(genderValue)),
    setCodeInTree: code => dispatch(actions.setCodeInTree(code))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(inputBoxes);
