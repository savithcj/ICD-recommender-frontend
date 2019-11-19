import React from "react";

import ListViewer from "./ListViewer";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/AutoComplete";

const searchBoxOptions = [
  { id: "1337", description: "test-label" },
  { id: "1338", description: "test-2" },
  { id: "1339", description: "test-label2" }
];

const searchBoxStyle = { width: "100%" };

const ListViewerWithSearch = props => {
  return (
    <React.Fragment>
      <Autocomplete
        id="combo-box"
        options={searchBoxOptions}
        getOptionLabel={item => item.description}
        style={searchBoxStyle}
        renderInput={params => <TextField {...params} label="type something" variant="outlined" fullwidth />}
      />
      <ListViewer {...props} />
    </React.Fragment>
  );
};

export default ListViewerWithSearch;
