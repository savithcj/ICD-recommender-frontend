import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";

const TagViewer = props => {
  return <ListViewer title="Tags" />;
};
