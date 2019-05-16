import React from 'react'
import Autosuggest from 'react-autosuggest'
import './DynamicInputField.css'

let data = null
  
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  function getSuggestions(value) {
    
    const escapedValue = escapeRegexCharacters(value.trim())

    if (escapedValue === '') {
      return []
    }
  
    const regex = new RegExp('^' + escapedValue, 'i')
  
    return data.filter(datum => regex.test(datum.lhs))
  }
  
  function getSuggestionValue(suggestion) {
    return suggestion.lhs
  }
  
  function renderSuggestion(suggestion) {
    return (
      <span>{suggestion.lhs}</span>
    )
  }
  
  class DynamicInputField extends React.Component {
    constructor(props) {
      super(props)
      
      this.state = {
        value: '',
        suggestions: [],
      }  

      data = this.props.data

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
        suggestions: getSuggestions(value)
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
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} 
        />
      )
    }
  }

  export default DynamicInputField;