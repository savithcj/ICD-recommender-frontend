import React from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import { connect } from "react-redux";

import * as actions from "../../Store/Actions/index";

const inputBoxes = props => {
  return (
    <CodeInputField
      id_code="input1"
      id_age="input2"
      id_gender="input3"
      placeholder_code="Search for a code"
      placeholder_age="Age"
      placeholder_gender="Gender"
      selectCode={this.addSelectedCode}
      selectAge={this.handleAgeSelection}
      selectGender={this.handleGenderSelection}
      codeCache={this.state.cachedCodeWithDescription}
      appendCodeToCache={this.appendCodeToCache}
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
    cachedCodes: state.cached.cachedCodes
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)();
