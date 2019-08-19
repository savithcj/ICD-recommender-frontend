import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useAlert, positions } from "react-alert";
import * as actions from "../../Store/Actions/index";
import * as APIUtility from "../../Util/API";
import { Link } from "react-router-dom";

function ForgotPassword(props) {
  const alert = useAlert();

  const sendEmail = () => {
    const email = document.getElementById("email").value;
    const body = { email: email };
    const options = {
      method: "POST",
      body: body
    };
    console.log(options);
    APIUtility.API.makeAPICall(APIUtility.FORGOT_PASSWORD, null, options)
      .then(response => {
        return response.status;
      })
      .then(statusCode => {
        if (statusCode === 200) {
          props.setAlertMessage({ message: "Email sent", messageType: "success" });
        } else {
          props.setAlertMessage({ message: "Request failed", messageType: "error" });
        }
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

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

  return (
    <React.Fragment>
      <h1>Forgot Password</h1>
      <div>
        Enter your email: <input type="text" id="email" defaultValue="Email Address" />
      </div>
      <div>
        <button onClick={sendEmail}>Submit</button>
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
)(ForgotPassword);
