import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";
import TagViewer from "./TagViewer";
import TagUploader from "./TagUploader";

const TagManager = props => {
  return (
    <div>
      <TagUploader />
      {/* <TagViewer /> */}
    </div>
  );
};

export default TagManager;
