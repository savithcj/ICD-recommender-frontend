import React from "react";
import Autosuggest from "react-autosuggest";
import "./DynamicInputField.css";

class DynamicInputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ""
    };
  }

  onChange = (_, { newValue }) => {
    // Defines what happens to DynamicInputField when the inputbox changes
    this.setState({
      value: newValue
    });
  };

  getSuggestions = value => {
    return this.props.data;
  };

  getSuggestionValue = suggestion => {
    // Defines what gets entered into the input box when an item is selected from the auto suggestion list
    return suggestion.code;
  };

  renderSuggestion = suggestion => {
    // Defines the content of auto suggestion list
    return (
      <span>
        {suggestion.description === ""
          ? suggestion.code
          : suggestion.code + ": " + suggestion.description}
      </span>
    );
  };

  onSuggestionsFetchRequested = ({ value }) => {
    // Calls a parent function (ActionListener) for when value changes in the input box
    const { id, onChange } = this.props;
    onChange(id, value);
  };

  onSuggestionsClearRequested = () => {
    // Gets called when the input box is cleared by user
  };

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

export default DynamicInputField;
