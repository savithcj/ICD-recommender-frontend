import React from "react";
import { Link } from "react-router-dom";

export default function Expired() {
  return (
    <React.Fragment>
      <h1>Session Expired</h1>
      <Link to="/sign-in"> Click to sign in </Link>
    </React.Fragment>
  );
}
