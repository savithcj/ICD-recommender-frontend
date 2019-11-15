import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";
import { connect } from "react-redux";
import { useAlert, positions } from "react-alert";
import { Redirect } from "react-router";

const useStyles = makeStyles(theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

function ResetPassword(props) {
  const alert = useAlert();

  const [token, setToken] = useState(null);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    console.log(params);
    setToken(params.get("token"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.alertMessage) {
      alert.show(props.alertMessage.message, {
        timeout: 2500,
        position: positions.MIDDLE,
        type: props.alertMessage.messageType
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.alertMessage]);

  const classes = useStyles();

  const resetPassword = () => {
    const newPass = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPass !== confirmPassword) {
      props.setAlertMessage({ message: "Passwords do not match!", messageType: "error" });
      return;
    }

    const body = { token: token, password: newPass };
    const options = {
      method: "POST",
      body: body
    };
    console.log(options);

    APIUtility.API.makeAPICall(APIUtility.RESET_PASSWORD, null, options)
      .then(response => {
        return response.status;
      })
      .then(statusCode => {
        if (statusCode === 200) {
          setIsResetSuccessful(true);
        } else {
          props.setAlertMessage({ message: "Password reset failed", messageType: "error" });
        }
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const onKeyPress = e => {
    if (e.which === 13) {
      resetPassword();
    }
  };

  if (isResetSuccessful) {
    return <Redirect to="/" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password"
            label="New Password"
            type="password"
            name="password"
            autoComplete="password"
            onKeyPress={onKeyPress}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirm-password"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="confirmPassword"
            onKeyPress={onKeyPress}
          />
          <Button onClick={resetPassword} fullWidth variant="contained" color="primary" className={classes.submit}>
            Reset Password
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/sign-in" variant="body2">
                Back to Sign-In
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
