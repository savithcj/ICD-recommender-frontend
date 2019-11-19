import React from "react";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import ListViewer from "../../Components/ListViewer/ListViewer";
import ListViewerWithSearch from "../../Components/ListViewer/ListViewerWithSearch";

const TagViewer = props => {
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
    { menuItemOnClick: props.enableAllTags, menuItemText: "Enable All" },
    { menuItemOnClick: props.disableAllTags, menuItemText: "Disable All" }
  ];

  const filterOnChange = e => {
    console.log("filter change", e);
  };

  return (
    <ListViewer
      title="Tags"
      dontAddDotBoolean={true}
      items={props.uploadedTags}
      valueName="id"
      filterBox={true}
      filterBoxOnChange={filterOnChange}
      descriptionName="description"
      acceptItemButton={{ title: "Enable tag", onClick: enableTag }}
      removeItemButton={{ title: "Disable tag", onClick: disableTag }}
      allowRearrage={props.uploadedTags.length > 1}
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
    disableTagByIndex: index => dispatch(actions.disableTagByIndex(index)),
    enableAllTags: () => dispatch(actions.enableAllTags()),
    disableAllTags: () => dispatch(actions.disableAllTags())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagViewer);
