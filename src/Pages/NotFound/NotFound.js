import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <React.Fragment>
      <h1>404 Invalid URL</h1>
      <Link to="/"> Click to go to home page </Link>
    </React.Fragment>
  );
}
