import React from 'react';
import logo from './logo.svg';
import './App.css';

import DynamicInputField from './Components/DynamicInputField/DynamicInputField'



function handleAddButton () {

  fetch('http://localhost:8000/api/rules/?format=json')
  .then(response => response.json())
  .then((jsonData) => {
      console.log(jsonData)
  })
  .catch((error) => {
    console.error(error)
  })

}


function App() {


  const change = (id, newValue) => { console.log(`${id} changed to ${newValue}`) }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DynamicInputField
          id="input1"
          onChange={change} />
        <button onClick={handleAddButton}>Add</button>
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
