import React from 'react';
import logo from './logo.svg';
import './App.css';

import DynamicInputField from './Components/DynamicInputField/DynamicInputField'

function App() {


  const change = (id, newValue)=>{console.log(`${id} changed to ${newValue}`)}

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DynamicInputField
        id="input1"
        onChange={change}/>
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
  );
}

export default App;
