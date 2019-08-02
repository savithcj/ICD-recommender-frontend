import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import "./index.css";
import "typeface-roboto";
import * as serviceWorker from "./Util/serviceWorker";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import reducer from "./Store/Reducers/index";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import Home from "./Pages/Home/Home";
import Admin from "./Pages/Admin/Admin";
import Visualization from "./Pages/Visualization/Visualization";
import SignIn from "./Pages/SignIn/SignIn";
import SignUp from "./Pages/SignUp/SignUp";
import Sandbox from "./Pages/Sandbox/Sandbox";
import Expired from "./Pages/Expired/Expired";
import SignedOut from "./Pages/SignedOut/SignedOut";
import ManageAccounts from "./Pages/ManageAccounts/ManageAccounts";

//enabling redux dev-tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

const notFound = () => <h1>Not Found</h1>;

const routing = (
  <Provider store={store}>
    <AlertProvider template={AlertTemplate}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-up" component={SignUp} />
          <Route path="/admin" component={Admin} />
          <Route path="/visualization" component={Visualization} />
          <Route path="/sandbox" component={Sandbox} />
          <Route path="/expired" component={Expired} />
          <Route path="/signed-out" component={SignedOut} />
          <Route path="/manage-accounts" component={ManageAccounts} />
          <Route>{notFound}</Route>
        </Switch>
      </BrowserRouter>
    </AlertProvider>
  </Provider>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

export default store;
