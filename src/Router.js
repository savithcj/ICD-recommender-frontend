import { Route, BrowserRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import store from "./Store/configureStore";

import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import Home from "./Pages/Home/Home";
import Annotate from "./Pages/Annotate/Annotate";
import Tags from "./Pages/Tags/Tags";
import Admin from "./Pages/Admin/Admin";
import Visualization from "./Pages/Visualization/Visualization";
import SignIn from "./Pages/SignIn/SignIn";
import SignUp from "./Pages/SignUp/SignUp";
import SignedOut from "./Pages/SignedOut/SignedOut";
import SignUpSuccess from "./Pages/SignUpSuccess/SignUpSuccess";
import ManageAccounts from "./Pages/ManageAccounts/ManageAccounts";
import About from "./Pages/About/About";
import NotFound from "./Pages/NotFound/NotFound";
import Forbidden from "./Pages/Forbidden/Forbidden";
import ServerDown from "./Pages/ServerDown/ServerDown";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Sandbox from "./Pages/Sandbox/Sandbox";

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
          <Route path="/signed-out" component={SignedOut} />
          <Route path="/sign-up-success" component={SignUpSuccess} />
          <Route path="/manage-accounts" component={ManageAccounts} />
          <Route path="/about" component={About} />
          <Route path="/forbidden" component={Forbidden} />
          <Route path="/server-down" component={ServerDown} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/sandbox" component={Sandbox} />
          <Route path="/tags" component={Tags} />
          <Route path="/annotate" component={Annotate} />
          <Route>{NotFound}</Route>
        </Switch>
      </BrowserRouter>
    </AlertProvider>
  </Provider>
);

export default router;
