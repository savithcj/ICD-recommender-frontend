import React from "react";
import Autosuggest from "react-autosuggest";
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
   * Defines what gets entered into the input box
   * when an item is selected from the auto suggestion list
   */
  getSuggestionValue = suggestion => {
    return suggestion.code;
  };

  /**
   * Defines the content of auto suggestion list
   */
  renderSuggestion = suggestion => {
    return (
      <span>
        {suggestion.description === ""
          ? suggestion.code
          : suggestion.code + ": " + suggestion.description}
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
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Enter code",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest
        id={id}
        suggestions={this.props.data}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

export default CodeInputField;
