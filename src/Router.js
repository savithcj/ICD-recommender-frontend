import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import store from "./Store/configureStore";

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
import SignUpSuccess from "./Pages/SignUpSuccess/SignUpSuccess";
import NotFound from "./Pages/NotFound/NotFound";

const router = (
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
          <Route path="/sign-up-success" component={SignUpSuccess} />
          <Route>{NotFound}</Route>
        </Switch>
      </BrowserRouter>
    </AlertProvider>
  </Provider>
);

export default router;
