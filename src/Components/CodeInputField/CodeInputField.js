import React from "react";
import AutoSuggest from "../AutoSuggest/AutoSuggest.js";
import "./CodeInputField.css";
import { addDotToCode } from "../../Util/utility";

import * as APIUtility from "../../Util/API";

const ageOptions = [...Array(120).keys()].map(x => "" + x);
const genderOptions = ["Male", "Female", "Other"];

class CodeInputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      codeAutoCompleteDisplayed: [],
      age: "",
      ageAutoCompleteDisplayed: [],
      gender: "",
      genderAutoCompleteDisplayed: []
    };
  }

  /**
   * Defines what happens to DynamicInputField when the inputbox changes
   */
  onChange = (_, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onAgeChange = (_, { newValue }) => {
    this.setState({
      age: newValue
    });
  };

  onGenderChange = (_, { newValue }) => {
    this.setState({
      gender: newValue
    });
  };

  /**
   * Defines what value is returned
   * when an item is selected from the auto suggestion list
   */
  getSuggestionValue = suggestion => {
    return suggestion.code;
  };

  getAgeSuggestionValue = suggestion => {
    return suggestion;
  };

  getGenderSuggestionValue = suggestion => {
    return suggestion;
  };

  /**
   * Called when an item is selected from the auto suggestion list
   */
  onSuggestionSelected = (_, { suggestion }) => {
    if (this.props.selectCode !== undefined) {
      this.props.selectCode(suggestion.code.replace(".", ""));
    }
    if (this.props.autoClearCode !== undefined) {
      if (this.props.autoClearCode === true) {
        this.setState({
          value: "",
          // age: "",
          gender: ""
        });
      }
    }
  };

  onAgeSuggestionSelected = (_, { suggestion }) => {
    if (this.props.selectAge !== undefined) {
      this.props.selectAge(suggestion);
    }
    this.setState({
      age: suggestion
    });
  };

  onGenderSuggestionSelected = (_, { suggestion }) => {
    if (this.props.selectGender !== undefined) {
      this.props.selectGender(suggestion);
    }
    this.setState({
      gender: suggestion
    });
  };

  /**
   * Defines the content of auto suggestion list
   */
  renderSuggestion = suggestion => {
    let displayedText = addDotToCode(suggestion.code);
    if (suggestion.description !== "") {
      displayedText = displayedText + " : " + suggestion.description;
    }

    return <span>{displayedText}</span>;
  };

  renderSectionTitle(section) {
    return <strong>{section.title}</strong>;
  }

  getSectionSuggestions(section) {
    return section.codes;
  }

  renderAgeSuggestion = suggestion => {
    return <span>{suggestion}</span>;
  };

  renderGenderSuggestion = suggestion => {
    return <span>{suggestion}</span>;
  };

  /**
   * Called upon when value changes in the input box
   */
  onSuggestionsFetchRequested = ({ value }) => {
    value = value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/gi, "");
    this.getMatchingCodesFromAPI(value);
  };

  onAgeSuggestionFetchRequested = ({ value }) => {
    if (value !== "") {
      const regex = new RegExp("^" + value, "i");
      const results = ageOptions.filter(item => regex.test(item));
      this.setState({ ageAutoCompleteDisplayed: results });
    }
  };

  onAgeSuggestionFetchRequested_b = ({ value }) => {
    if (value !== "") {
      const regex = new RegExp("^" + value, "i");
      const results = ageOptions.filter(item => regex.test(item));
      this.setState({ ageAutoCompleteDisplayed_b: results });
    }
  };

  onGenderSuggestionFetchRequested = ({ value }) => {
    if (value !== "") {
      value = value.trim().toUpperCase();
      const regex = new RegExp("^" + value, "i");
      const results = genderOptions.filter(item => regex.test(item));
      this.setState({ genderAutoCompleteDisplayed: results });
    }
  };

  /**
   * Call API to look up code
   * @param {*} inputValue
   */
  getMatchingCodesFromAPI(inputValue) {
    const { appendCodeToCache } = this.props;

    if (inputValue !== "") {
      APIUtility.API.makeAPICall(APIUtility.CODE_AUTO_SUGGESTIONS, inputValue)
        .then(response => response.json())
        .then(results => {
          if (appendCodeToCache !== undefined) {
            appendCodeToCache(
              results["code matches"].concat(results["description matches"]).concat(results["keyword matches"])
            );
          }
          this.populateAutoCompleteList(results, inputValue);
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    }
  }

  /**
   * Required for code searchbox Auto-Complete
   * Get code suggestions by searching codes stored in the state and return results
   *
   * Called when a code is entered to be searched
   */
  populateAutoCompleteList(suggestionsFromAPI, enteredCode) {
    let autoCompleteList = [];

    const codeAndDescription =
      this.props.codeCache !== undefined ? Array.from(this.props.codeCache) : Array.from(suggestionsFromAPI);
    const regex = new RegExp("^" + enteredCode, "i");
    const codeMatches = codeAndDescription.filter(item => regex.test(item.code));

    if (codeMatches.length > 0) {
      autoCompleteList.push({ title: "Code Matches", codes: codeMatches });
    }

    if (suggestionsFromAPI["description matches"].length > 0) {
      autoCompleteList.push({ title: "Description Matches", codes: suggestionsFromAPI["description matches"] });
    }

    if (suggestionsFromAPI["keyword matches"].length > 0) {
      autoCompleteList.push({ title: "Keyword Matches", codes: suggestionsFromAPI["keyword matches"] });
    }

    this.setState({ codeAutoCompleteDisplayed: autoCompleteList });
  }

  /**
   * Gets called when the input box is cleared by user
   */
  onSuggestionsClearRequested = () => {};

  render() {
    const { id_code, id_age, id_gender, placeholder_code, placeholder_age, placeholder_gender } = this.props;
    // if id_age and id_gender are not defined in props, the corresponding inputfields will not be rendered
    const enable_code = this.props.id_code === undefined ? false : true;
    const enable_age = this.props.id_age === undefined ? false : true;
    const enable_gender = this.props.id_gender === undefined ? false : true;
    const {
      value,
      age,
      gender,
      codeAutoCompleteDisplayed,
      ageAutoCompleteDisplayed,
      genderAutoCompleteDisplayed
    } = this.state;
    const inputProps = {
      placeholder: placeholder_code,
      value: value,
      onChange: this.onChange
    };
    const ageInputProps = {
      placeholder: placeholder_age,
      value: age,
      onChange: this.onAgeChange
    };

    const genderInputProps = {
      placeholder: placeholder_gender,
      value: gender,
      onChange: this.onGenderChange
    };

    const codeInputBox = (
      <div
        className="code_input"
        style={{ width: this.props.width_code === undefined ? "100%" : this.props.width_code }}
      >
        <AutoSuggest
          id={id_code}
          multiSection={true}
          suggestions={codeAutoCompleteDisplayed}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          onSuggestionSelected={this.onSuggestionSelected}
          renderSectionTitle={this.renderSectionTitle}
          getSectionSuggestions={this.getSectionSuggestions}
          inputProps={inputProps}
          highlightFirstSuggestion={true}
        />
      </div>
    );

    const ageInputBox = (
      <div className="age_input" style={{ width: this.props.width_age === undefined ? "100%" : this.props.width_age }}>
        <AutoSuggest
          id={id_age}
          suggestions={ageAutoCompleteDisplayed}
          onSuggestionsFetchRequested={this.onAgeSuggestionFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getAgeSuggestionValue}
          onSuggestionSelected={this.onAgeSuggestionSelected}
          renderSuggestion={this.renderAgeSuggestion}
          inputProps={ageInputProps}
          highlightFirstSuggestion={true}
        />
      </div>
    );

    const genderInputBox = (
      <div
        className="gender_input"
        style={{ width: this.props.width_gender === undefined ? "100%" : this.props.width_gender }}
      >
        <AutoSuggest
          id={id_gender}
          suggestions={genderAutoCompleteDisplayed}
          onSuggestionsFetchRequested={this.onGenderSuggestionFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getGenderSuggestionValue}
          onSuggestionSelected={this.onGenderSuggestionSelected}
          renderSuggestion={this.renderGenderSuggestion}
          inputProps={genderInputProps}
          highlightFirstSuggestion={true}
        />
      </div>
    );

    return (
      <React.Fragment>
        {enable_code ? codeInputBox : null}
        {enable_age ? ageInputBox : null}
        {enable_gender ? genderInputBox : null}
      </React.Fragment>
    );
  }
}

export default CodeInputField;
