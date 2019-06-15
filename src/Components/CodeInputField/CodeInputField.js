import React from "react";
import AutoSuggest from "../AutoSuggest/AutoSuggest.js";
import AutosuggestHighlightMatch from "../AutoSuggest/match";
import AutosuggestHighlightParse from "../AutoSuggest/parse";
import "./CodeInputField.css";

const ageOptions = [...Array(120).keys()].map(x => "" + x);
const genderOptions = ["Male", "Female", "Other"];

class CodeInputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      codeAutoCompleteDisplayed: [],
      age_a: "",
      age_b: "",
      ageAutoCompleteDisplayed_a: [],
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

  onAgeChange_a = (_, { newValue }) => {
    this.setState({
      age_a: newValue
    });
  };

  onAgeChange_b = (_, { newValue }) => {
    this.setState({
      age_b: newValue
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
      age_a: "",
      age_b: "",
      gender: ""
    });
  };

  onAgeSuggestionSelected_a = (_, { suggestion }) => {
    this.props.selectAge(suggestion);
    this.setState({
      age_a: suggestion
    });
  };

  onAgeSuggestionSelected_b = (_, { suggestion }) => {
    this.props.selectAge(suggestion);
    this.setState({
      age_b: suggestion
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
   * Called upon when value changes in the input box
   */
  onSuggestionsFetchRequested = ({ value }) => {
    value = value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/gi, "");
    this.getMatchingCodesFromAPI(value);
  };

  onAgeSuggestionFetchRequested_a = ({ value }) => {
    if (value !== "") {
      const regex = new RegExp("^" + value, "i");
      const results = ageOptions.filter(item => regex.test(item));
      this.setState({ ageAutoCompleteDisplayed_a: results });
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
      const url = "http://localhost:8000/api/codeAutosuggestions/" + inputValue + "/?format=json";

      fetch(url)
        .then(response => response.json())
        .then(results => {
          if (appendCodeToCache !== undefined) {
            appendCodeToCache(
              results["code matches"].concat(results["description matches"]).concat(results["keyword matches"])
            );
          }
          this.populateAutoCompleteList(results, inputValue);
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

    if (suggestionsFromAPI["keyword matches"].length > 0) {
      autoCompleteList.push({ title: "Keyword Matches", codes: suggestionsFromAPI["keyword matches"] });
    }

    if (suggestionsFromAPI["description matches"].length > 0) {
      autoCompleteList.push({ title: "Description Matches", codes: suggestionsFromAPI["description matches"] });
    }

    const codeAndDescription = Array.from(this.props.codeCache);
    const regex = new RegExp("^" + enteredCode, "i");
    const codeMatches = codeAndDescription.filter(item => regex.test(item.code));
    if (codeMatches.length > 0) {
      autoCompleteList.push({ title: "Code Matches", codes: codeMatches });
    }

    this.setState({ codeAutoCompleteDisplayed: autoCompleteList });
  }

  /**
   * Gets called when the input box is cleared by user
   */
  onSuggestionsClearRequested = () => {};

  render() {
    const {
      id_code,
      id_age_a,
      id_age_b,
      id_gender,
      placeholder_code,
      placeholder_age_a,
      placeholder_age_b,
      placeholder_gender
    } = this.props;
    // if id_age and id_gender are not defined in props, the corresponding inputfields will not be rendered
    const enable_age_a = this.props.id_age_a === undefined ? false : true;
    const enable_age_b = this.props.id_age_b === undefined ? false : true;
    const enable_gender = this.props.id_gender === undefined ? false : true;
    const {
      value,
      age_a,
      age_b,
      gender,
      codeAutoCompleteDisplayed,
      ageAutoCompleteDisplayed_a,
      ageAutoCompleteDisplayed_b,
      genderAutoCompleteDisplayed
    } = this.state;
    const inputProps = {
      placeholder: placeholder_code,
      value: value,
      onChange: this.onChange
    };
    const ageInputProps_a = {
      placeholder: placeholder_age_a,
      value: age_a,
      onChange: this.onAgeChange_a
    };
    const ageInputProps_b = {
      placeholder: placeholder_age_b,
      value: age_b,
      onChange: this.onAgeChange_b
    };
    const genderInputProps = {
      placeholder: placeholder_gender,
      value: gender,
      onChange: this.onGenderChange
    };

    const codeInputBox = (
      <div className="code_input">
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

    const ageInputBox_a = (
      <div className="age_input">
        <AutoSuggest
          id={id_age_a}
          suggestions={ageAutoCompleteDisplayed_a}
          onSuggestionsFetchRequested={this.onAgeSuggestionFetchRequested_a}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getAgeSuggestionValue}
          onSuggestionSelected={this.onAgeSuggestionSelected_a}
          renderSuggestion={this.renderAgeSuggestion}
          onSuggestionSelected={this.onAgeSuggestionSelected_a}
          inputProps={ageInputProps_a}
          highlightFirstSuggestion={true}
        />
      </div>
    );

    const ageInputBox_b = (
      <div className="age_input">
        <AutoSuggest
          id={id_age_b}
          suggestions={ageAutoCompleteDisplayed_b}
          onSuggestionsFetchRequested={this.onAgeSuggestionFetchRequested_b}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getAgeSuggestionValue}
          onSuggestionSelected={this.onAgeSuggestionSelected_b}
          renderSuggestion={this.renderAgeSuggestion}
          onSuggestionSelected={this.onAgeSuggestionSelected_b}
          inputProps={ageInputProps_b}
          highlightFirstSuggestion={true}
        />
      </div>
    );

    const genderInputBox = (
      <div className="gender_input">
        <AutoSuggest
          id={id_gender}
          suggestions={genderAutoCompleteDisplayed}
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
    );

    return (
      <div>
        {codeInputBox}
        {enable_age_a ? ageInputBox_a : null}
        {enable_age_b ? ageInputBox_b : null}
        {enable_gender ? genderInputBox : null}
      </div>
    );
  }
}

export default CodeInputField;
