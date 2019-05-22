import React from "react";
// import Autosuggest from "react-autosuggest";

import AutoSuggest from "../AutoSuggest/AutoSuggest.js";

import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import "./CodeInputField.css";

class CodeInputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ""
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

  /**
   * Defines what value is returned
   * when an item is selected from the auto suggestion list
   */
  getSuggestionValue = suggestion => {
    return suggestion.code;
  };

  /**
   * Called when an item is selected from the auto suggestion list
   */
  onSuggestionSelected = (_, { suggestion }) => {
    this.props.selectCode(suggestion.code);
    this.setState({
      value: ""
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
          const className = part.highlight
            ? "react-autosuggest__suggestion-match"
            : null;

          return (
            <span className={className} key={index}>
              {part.text}
            </span>
          );
        })}
      </span>
    );
  };

  /**
   * Calls a parent function (ActionListener) for when value changes in the input box
   */
  onSuggestionsFetchRequested = ({ value }) => {
    const { id, onChange } = this.props;
    onChange(id, value);
  };

  /**
   * Gets called when the input box is cleared by user
   */
  onSuggestionsClearRequested = () => {};

  render() {
    const { id, placeholder } = this.props;
    const { value } = this.state;
    const inputProps = {
      placeholder: placeholder,
      value,
      onChange: this.onChange
    };

    return (
      <AutoSuggest
        id={id}
        suggestions={this.props.data}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        onSuggestionSelected={this.onSuggestionSelected}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
      />
    );
  }
}

export default CodeInputField;
