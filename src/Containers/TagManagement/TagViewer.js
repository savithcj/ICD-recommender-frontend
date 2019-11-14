import React, { useState, useEffect, Component } from "react";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";

const TagViewer = props => {
  const enableAllTags = () => {};

  const disableAllTags = () => {};

  const shouldHideRemoveButton = index => {
    return props.uploadedTags[index].disabled ? true : false;
  };

  const shouldHideAcceptButton = index => {
    return props.uploadedTags[index].disabled ? false : true;
  };

  const disableTag = event => {
    props.disableTagByIndex(event.currentTarget.id);
  };

  const enableTag = event => {
    props.enableTagByIndex(event.currentTarget.id);
  };

  const selectedTagsComponentMenuItems = [
    { menuItemOnClick: enableAllTags, menuItemText: "Enable All" },
    { menuItemOnClick: disableAllTags, menuItemText: "Disable All" }
  ];

  return (
    <ListViewer
      title="Tags"
      dontAddDotBoolean={true}
      items={props.uploadedTags}
      noItemMessage="No tags available."
      valueName="id"
      descriptionName="description"
      acceptItemButton={{ title: "Enable tag", onClick: enableTag }}
      removeItemButton={{ title: "Disable tag", onClick: disableTag }}
      allowRearrange={props.uploadedTags.length > 1}
      onSortEndCallback={updatedList => {
        props.setUploadedTags(updatedList);
      }}
      shouldHideAcceptButton={shouldHideAcceptButton}
      shouldHideRemoveButton={shouldHideRemoveButton}
      menuOptions={selectedTagsComponentMenuItems}
    />
  );
};

const mapStateToProps = state => {
  return {
    uploadedTags: state.tagManagement.uploadedTags
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUploadedTags: tags => dispatch(actions.setUploadedTags(tags)),
    enableTagByIndex: index => dispatch(actions.enableTagByIndex(index)),
    disableTagByIndex: index => dispatch(actions.disableTagByIndex(index))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagViewer);
