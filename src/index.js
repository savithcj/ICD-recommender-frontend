import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import Sandbox from "./Sandbox";
import Admin from "./Components/Admin/Admin";
import * as serviceWorker from "./serviceWorker";

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/admin" component={Admin} />
      <Route path="/superSecret1337HaxorPage" component={Sandbox} />
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
