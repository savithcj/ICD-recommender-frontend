import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";

import { removeSelectedCode } from "../../Store/Actions/selected";

const selectedCodesViewer = props => {
  const selectedCodesComponentMenuItems = [
    {
      menuItemOnClick: props.selectedCodes.length < 2 ? null : null, //this.resetSelectedCodes,
      menuItemText: "Remove All Items"
    }
  ];
  return (
    <ListViewer
      title="Selected Codes"
      items={props.selectedCodes}
      noItemsMessage="No codes selected"
      valueName="code"
      descriptionName="description"
      removeItemButton={props.handleRemoveSelectedCode}
      //   exploreButton={this.handleExploreSelectedCodeButton}
      //   onSortEndCallback={updatedListOfSelectedCodes => {
      // this.setState({ selectedCodes: updatedListOfSelectedCodes });
      //   }}
      //   allowRearrage={this.state.selectedCodes.length > 1}
      menuOptions={selectedCodesComponentMenuItems}
      //   button={this.state.selectedCodes.length > 0 ? acceptSelectedCodesButton : null}
      disableTitleGutters={true}
    />
  );
};

const mapStateToProps = state => {
  return {
    selectedCodes: state.selectedCodes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRemoveSelectedCode: event => {
      const removeCodeIndex = parseInt(event.currentTarget.id, 10);
      return dispatch(removeSelectedCode(removeCodeIndex));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(selectedCodesViewer);
