import React from 'react'
import Autosuggest from 'react-autosuggest'
import './DynamicInputField.css'


class DynamicInputField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
      suggestions: [],
    }

  }

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  getSuggestions = (value) => {

    const escapedValue = this.escapeRegexCharacters(value.trim())

    if (escapedValue === '') {
      return []
    }

    const regex = new RegExp('^' + escapedValue, 'i')

    return this.props.data.filter(datum => regex.test(datum.code))
  }

  getSuggestionValue = (suggestion) => {
    return suggestion.code
  }

  renderSuggestion = (suggestion) => {
    return (
      <span>{suggestion.code}</span>
    )
  }

  onChange = (_, { newValue }) => {
    const { id, onChange } = this.props;

    this.setState({
      value: newValue
    })

    onChange(id, newValue)
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  render() {

    const { id, placeholder } = this.props
    const { value, suggestions } = this.state
    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange
    }

    return (
      <Autosuggest
        id={id}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
      />
    )
  }
}

export default DynamicInputField;