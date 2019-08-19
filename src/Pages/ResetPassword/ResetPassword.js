import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useAlert, positions } from "react-alert";
import * as actions from "../../Store/Actions/index";
import { Link } from "react-router-dom";

function ResetPassword(props) {
  const alert = useAlert();

  useEffect(() => {
    if (props.alertMessage) {
      alert.show(props.alertMessage.message, {
        timeout: 2500,
        position: positions.MIDDLE,
        type: props.alertMessage.messageType,
        onClose: () => {
          props.setAlertMessage(null);
        }
      });
    }
  }, [props.alertMessage]);

  const reset = () => {};

  return (
    <React.Fragment>
      <h1>Reset Password</h1>
      <div>
        Password: <input type="text" name="password1" defaultValue="Password" />
      </div>
      <div>
        Confirm: <input type="text" name="password2" defaultValue="Password" />
      </div>
      <div>
        <button onClick={reset}>Submit</button>
      </div>
      <Link to="/sign-in">Back to Sign-In</Link>
    </React.Fragment>
  );
}

const mapStateToProps = state => {
  return { alertMessage: state.alert.alertMessage };
};

const mapDispatchToProps = dispatch => {
  return {
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetPassword);
