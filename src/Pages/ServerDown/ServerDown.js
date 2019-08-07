import React from "react";
import { Link } from "react-router-dom";

export default function ServerDown() {
  return (
    <React.Fragment>
      <h1>Server not responding...</h1>
      <Link to="/"> Click to try reconnecting </Link>
    </React.Fragment>
  );
}
