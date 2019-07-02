import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";

import * as actions from "../../Store/Actions/index";

const daggerAsterisksViewer = props => {
  const componentMenuItems = [];
  return (
    <ListViewer
      title="Dagger/Asterisks"
      items={this.state.suggestedDaggerAsterisks}
      noItemsMessage="No dagger or asterisks suggested"
      nullItemsMessage="Add codes to see dagger/asterisks"
      valueName="combo"
      descriptionName="description"
      //   acceptItemButton={this.handleAcceptDaggerAsteriskCode}
      //   removeItemButton={this.handleRemoveDaggerAsteriskCode}
      //   exploreButton={this.handleExploreDaggerAsterisk}
      allowRearrage={false}
      menuOptions={componentMenuItems}
    />
  );
};

const mapStateToProps = state => {
  return {
    suggestedDaggerAsterisks: state.daggerAsterisks.recommendedCodes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    removeCode: removeCodeIndex => dispatch(actions.removeSelectedCode(removeCodeIndex)),
    setCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(recommendedCodesViewer);
