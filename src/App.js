import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import DynamicInputField from './Components/DynamicInputField/DynamicInputField'




class App extends Component {


  state = {
    data: null,
  }


  change = (id, newValue) => { console.log(`${id} changed to ${newValue}`) }

  handleAddButton = () => {

    // fetch('http://localhost:8000/api/rules/?format=json')
    // .then(response => response.json())
    // .then((jsonData) => {
    //     console.log(jsonData)
    // })
    // .catch((error) => {
    //   console.error(error)
    // })
    

  }

  getData(){

    fetch('http://localhost:8000/api/rules/?format=json')
      .then(response => response.json())
      .then((result) => {
        this.setState({data: result})
      })
  
  }

  render() {

    this.getData();

    // console.log(this.state.data)

    return (
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DynamicInputField
          id="input1"
          onChange={() => this.change()} 
          data={this.state.data}/>
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
