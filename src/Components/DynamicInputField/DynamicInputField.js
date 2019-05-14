import React from 'react'
import Autosuggest from 'react-autosuggest'
import './DynamicInputField.css'

const data = [
    {
        name: 'C',
        year: 1972
    },
    {
        name: 'C#',
        year: 2000
    },
    {
        name: 'C++',
        year: 1983
    },
    {
        name: 'Clojure',
        year: 2007
    },
    {
        name: 'Test',
        year: 2019
    }
  ]
  
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  function getSuggestions(value) {
    console.log("getSuggestions called with " + value)
    
    const escapedValue = escapeRegexCharacters(value.trim())

    if (escapedValue === '') {
      return []
    }
  
    const regex = new RegExp('^' + escapedValue, 'i')
  
    return data.filter(datum => regex.test(datum.name))
  }
  
  function getSuggestionValue(suggestion) {
    return suggestion.name
  }
  
  function renderSuggestion(suggestion) {
    return (
      <span>{suggestion.name}</span>
    )
  }
  
  class DynamicInputField extends React.Component {
    constructor() {
      super()
  
      this.state = {
        value: '',
        suggestions: []
      }  
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