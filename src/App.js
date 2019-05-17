import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import DynamicInputField from './Components/DynamicInputField/DynamicInputField'

class App extends Component {

  state = {
    rules: null,
  }

  constructor() {
    super()
    this.getAndSetRules()
  }

  changed = (id, newValue) => { 
    console.log(`${id} changed to ${newValue}`) 
  }

  handleAddButton = () => {
  }

  getAndSetRules() {
    fetch('http://localhost:8000/api/rules/?format=json')
      .then(response => response.json())
      .then(result => {
        this.setState({rules: result})
      })
  }

  render() {

    //react calls the render method asynchronously before the data is retrieved 
    //from the API call. The following if statement is needed make sure that the 
    //input field is rendered only once the data is retrieved
    let inputField = null
    if (this.state.rules != null) {
      inputField = (
        <DynamicInputField
          id="input1"
          data={this.state.rules} 
          />
      )
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {inputField}
          <button onClick={() => this.handleAddButton()}>Add</button>
          <p>
            Edit <code>src/App.js</code> and save to reload.
        </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
        </a>
        </header>
      </div>

    )

  }

}

export default App;
