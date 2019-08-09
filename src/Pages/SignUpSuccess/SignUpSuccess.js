import React from "react";
import { Link } from "react-router-dom";

export default function SignUpSuccess() {
  return (
    <React.Fragment>
      <h1>Account sign up request successful.</h1>
      <Link to="/sign-in"> Click to go to sign in page </Link>
    </React.Fragment>
  );
}
