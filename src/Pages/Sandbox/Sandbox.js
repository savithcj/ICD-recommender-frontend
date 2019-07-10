import React from "react";

export default function Sandbox() {
  const elementArray = [<h1>Hello</h1>, <h1>world</h1>];
  return <ul>{elementArray}</ul>;
}
