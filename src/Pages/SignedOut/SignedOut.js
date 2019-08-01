import React from "react";
import { Link } from "react-router-dom";

export default function SignedOut() {
  return (
    <React.Fragment>
      <h1>Signed out successfully</h1>
      <Link to="/sign-in"> Click to sign back in </Link>
    </React.Fragment>
  );
}
