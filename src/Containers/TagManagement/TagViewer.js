import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";

const TagViewer = props => {
  const tags = [
    { tag: "negation", description: "some negation description" },
    { tag: "closure", description: "closure description" }
  ];

  const resetUploadedTags = () => {
    props.setUploadedTags([]);
  };

  const selectedTagsComponentMenuItems = [
    {
      menuItemOnClick: resetUploadedTags,
      menuItemText: "Remove All"
    }
  ];

  const handleRemoveTag = () => {};

  return (
    <ListViewer
      title="Tags"
      disableTitleGutters={true}
      dontAddDotBoolean={true}
      items={tags}
      noItemMessage="No tags available."
      valueName="tag"
      descriptionName="description"
      removeItemButton={{ title: "Disable tag", onClick: handleRemoveTag }}
      allowRearrange={true}
      menuOptions={[]}
    />
  );
};

const mapStateToProps = state => {
  return {
    uploadedTags: state.uploadedTags
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUploadedTags: tags => dispatch(actions.setUploadedTags(tags)),
    appendToUploadedTags: tags => dispatch(actions.appendToUploadedTags(tags))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagViewer);
