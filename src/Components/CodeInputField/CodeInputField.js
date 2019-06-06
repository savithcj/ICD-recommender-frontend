import React from "react";
// import Autosuggest from "react-autosuggest";

import AutoSuggest from "../AutoSuggest/AutoSuggest.js";

import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import "./CodeInputField.css";

const ageOptions = [
  ...Array(120)
    .keys()
    .toString()
];
const genderOptions = ["Male", "Female", "Other"];

class CodeInputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      age: "",
      gender: ""
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
    this.props.selectCode(suggestion.code);
    this.setState({
      value: "",
      age: "",
      gender: ""
    });
  };

  onAgeSuggestionSelected = (_, { suggestion }) => {
    this.props.selectAge(suggestion);
    this.setState({
      age: suggestion
    });
  };

  onGenderSuggestionSelected = (_, { suggestion }) => {
    this.setState({
      gender: suggestion
    });
  };

  /**
   * Defines the content of auto suggestion list
   */
  renderSuggestion = (suggestion, { query }) => {
    let displayedText = suggestion.code;
    if (suggestion.description !== "") {
      displayedText = displayedText + ": " + suggestion.description;
    }
    const matches = AutosuggestHighlightMatch(displayedText, query);
    const parts = AutosuggestHighlightParse(displayedText, matches);

    return (
      <span>
        {parts.map((part, index) => {
          const className = part.highlight ? "react-autosuggest__suggestion-match" : null;

          return (
            <span className={className} key={index}>
              {part.text}
            </span>
          );
        })}
      </span>
    );
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
   * Calls a parent function (ActionListener) for when value changes in the input box
   */
  onSuggestionsFetchRequested = ({ value }) => {
    const { id, onChange } = this.props;
    onChange(id, value);
  };

  onAgeSuggestionFetchRequested = ({ value }) => {
    const { id, onAgeChange } = this.props;
    onAgeChange(id, value);
  };

  onGenderSuggestionFetchRequested = ({ value }) => {
    const { id, onGenderChange } = this.props;
    onGenderChange(id, value);
  };

  /**
   * Gets called when the input box is cleared by user
   */
  onSuggestionsClearRequested = () => {};

  render() {
    const { id_code, id_age, id_gender, placeholder } = this.props;
    const { value, age, gender } = this.state;
    const inputProps = {
      placeholder: placeholder,
      value: value,
      onChange: this.onChange
    };
    const ageInputProps = {
      placeholder: "Age",
      value: age,
      onChange: this.onAgeChange
    };
    const genderInputProps = {
      placeholder: "Gender",
      value: gender,
      onChange: this.onGenderChange
    };

    return (
      <div>
        <div className="code_input">
          <AutoSuggest
            id={id_code}
            multiSection={true}
            suggestions={this.props.codes}
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
        <div className="age_input">
          <AutoSuggest
            id={id_age}
            suggestions={this.props.ages}
            onSuggestionsFetchRequested={this.onAgeSuggestionFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getAgeSuggestionValue}
            onSuggestionSelected={this.onAgeSuggestionSelected}
            renderSuggestion={this.renderAgeSuggestion}
            onSuggestionSelected={this.onAgeSuggestionSelected}
            inputProps={ageInputProps}
            highlightFirstSuggestion={true}
          />
        </div>
        <div className="gender_input">
          <AutoSuggest
            id={id_gender}
            suggestions={this.props.genders}
            onSuggestionsFetchRequested={this.onGenderSuggestionFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getGenderSuggestionValue}
            onSuggestionSelected={this.onGenderSuggestionSelected}
            renderSuggestion={this.renderGenderSuggestion}
            onSuggestionSelected={this.onGenderSuggestionSelected}
            inputProps={genderInputProps}
            highlightFirstSuggestion={true}
          />
        </div>
      </div>
    );
  }
}

export default CodeInputField;
