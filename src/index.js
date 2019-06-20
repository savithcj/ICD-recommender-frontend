import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import "./index.css";
import "typeface-roboto";
import App from "./App";
import Sandbox from "./Sandbox";
import Admin from "./Components/Admin/Admin";
import * as serviceWorker from "./serviceWorker";
import Visualization from "./Components/Visualization/Visualization";

const notFound = () => <h1>Not Found</h1>;

const routing = (
  //TODO: get rid of Sandbox route used for testing
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/admin" component={Admin} />
        <Route path="/sandbox" component={Sandbox} />
        <Route path="/visualization" component={Visualization} />
        <Route>{notFound}</Route>
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
