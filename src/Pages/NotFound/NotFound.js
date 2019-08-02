import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <React.Fragment>
      <h1>404 Invalid URL</h1>
      <Link to="/sign-in"> Click to go to sign in page </Link>
    </React.Fragment>
  );
}
