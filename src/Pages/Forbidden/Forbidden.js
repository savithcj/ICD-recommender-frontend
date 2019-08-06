import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <React.Fragment>
      <h1>Forbidden</h1>
      <Link to="/"> Click to return to main page </Link>
    </React.Fragment>
  );
}
