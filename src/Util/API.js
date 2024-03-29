import store from "../Store/configureStore";
import * as actions from "../Store/Actions/index";

// ENDPOINTS----------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
export const RULES = "RULES";
export const CHILDREN = "CHILDREN";
export const FAMILY = "FAMILY";
export const CODE_DESCRIPTION = "CODE_DESCRIPTION";
export const REQUEST_RULES = "REQUEST_RULES";
export const REQUEST_ACTIVE_RULES = "REQUEST_ACTIVE_RULES";
export const MATCH_DESCRIPTION = "MATCH_DESCRIPTION";
export const ANCESTORS = "ANCESTORS";
export const CODE_AUTO_SUGGESTIONS = "CODE_AUTO_SUGGESTIONS";
export const CODE_BLOCK_USAGE = "CODE_BLOCK_USAGE";
export const CREATE_RULE = "CREATE_RULE";
export const RULE_SEARCH = "RULE_SEARCH";
export const FLAG_RULE_FOR_REVIEW = "FLAG_RULE_FOR_REVIEW";
export const FLAGGED_RULES = "FLAGGED_RULES";
export const UPDATE_FLAGGED_RULE = "UPDATE_FLAGGED_RULE";
export const DAGGER_ASTERISK = "DAGGER_ASTERISK";
export const ENTER_LOG = "ENTER_LOG";
export const RULE_STATUS = "RULE_STATUS";
export const INACTIVE_RULES = "INACTIVE_RULES";
export const STATS = "STATS";
export const CHECK_CODE = "CHECK_CODE";
export const GET_TOKEN = "GET_TOKEN";
export const CREATE_USER = "CREATE_USER";
export const LIST_UNVERIFIED_ACCOUNTS = "LIST_UNVERIFIED_ACCOUNTS";
export const APPROVE_USER = "APPROVE_USER";
export const REJECT_USER = "REJECT_USER";
export const VALIDATE_TOKEN = "VALIDATE_TOKEN";
export const FORGOT_PASSWORD = "FORGOT_PASSWORD";
export const RESET_PASSWORD = "RESET_PASSWORD";
export const UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT";
export const GET_SECTIONS = "GET_SECTIONS";

/**
 * API class used to connect to the backend
 * Deals with token authorization and all other API calls
 */
export class API {
  static serverAdress = process.env.REACT_APP_SERVER_ADDRESS; //window.location.hostname; //Only if API on same server as React
  static urlBeginning = this.serverAdress + "/api/";
  static authUrlBeginning = this.serverAdress + "/o/";
  static json = "/?format=json";

  // MISCELLANEOUS HELPER METHODS--------------------------------------------------------
  //-------------------------------------------------------------------------------------
  /**
   * Method used to remove the user related store values from the store
   */
  static _revokeUserAuthorizationFromStore() {
    store.dispatch(actions.setIsAuthorized(false));
    store.dispatch(actions.setUserRole(null));
  }

  // METHODS DEALING WITH TOKENS---------------------------------------------------------
  //-------------------------------------------------------------------------------------

  /**
   * Helper method used to make the get token API call and handle the response
   */
  static _handleGetTokenAPICall(options) {
    this.makeAPICall(GET_TOKEN, null, options)
      .then(response => response.json())
      .then(response => {
        if (response.access_token !== undefined) {
          localStorage.setItem("tokenObject", JSON.stringify(response));
          store.dispatch(actions.setUserRole(response.user.role));
          store.dispatch(actions.setIsAuthorized(true));
        } else {
          store.dispatch(actions.setAlertMessage({ message: "Invalid username or password", messageType: "error" }));
        }
      })
      .catch(error => {
        console.log("[ERROR GETTING TOKEN]", error);
      });
  }

  /**
   * Used to request a token from the backend server and handle the response
   */
  static getTokenFromAPI(username, password) {
    const body = {
      username: username,
      password: password,
      grant_type: "password"
    };
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const options = {
      method: "POST",
      headers: headers,
      body: body
    };

    this._handleGetTokenAPICall(options);
  }

  /**
   * Retrieves the saved token from the local storage. If the local storage does not
   * contain the token, returns -1
   */
  static getTokenFromLS() {
    const localStorageToken = localStorage.getItem("tokenObject");
    if (localStorageToken !== "" && localStorageToken !== null) {
      return JSON.parse(localStorageToken).access_token;
    } else {
      return -1;
    }
  }

  /**
   * Used to verify the validity of the token stored in local storage
   */
  static verifyLSToken = callBackFunction => {
    this.makeAPICall(VALIDATE_TOKEN)
      .then(response => {
        if (response.status === 200) {
          store.dispatch(actions.setIsAuthorized(true));
          store.dispatch(actions.setUserRole(JSON.parse(localStorage.getItem("tokenObject")).user.role));
        }
        store.dispatch(actions.setIsServerDown(false));
        callBackFunction();
      })
      .catch(err => {
        callBackFunction();
      });
  };

  /**
   * Used to revoke the existing token in the local storage
   * Removes the token from the local storage and makes an API
   * call to revoke the token from the backend server.
   */
  static revokeToken() {
    this._revokeUserAuthorizationFromStore();

    const url = this.authUrlBeginning + "revoke_token/";
    const tokenFromLS = this.getTokenFromLS();

    localStorage.setItem("tokenObject", "");

    const data = { token: tokenFromLS, client_id: process.env.REACT_APP_CLIENT_ID };
    const options = {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: data
    };

    this._fetchFromAPI(url, options);
  }

  // HELPER METHODS DEALING WITH API CALLS-----------------------------------------------
  //-------------------------------------------------------------------------------------
  /**
   * Method used to add the authorization token from the local storage before making
   * the API call.
   */
  static _addAuthorization(url, options = {}) {
    const oAuthToken = this.getTokenFromLS();

    let bearer = "Bearer " + oAuthToken;

    // Append token to header. Create header if it does not exist
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers["Authorization"] = bearer;
    return this._fetchFromAPI(url, options);
  }

  /**
   * This method makes the API call and returns the API response as promise
   * If the token is expired, updates the corresponding flag in the store
   * If the server is not responding, updates the corresponding flag in the store
   */
  static _fetchFromAPI(url, options = {}) {
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers["Content-Type"] = "application/json";
    if (options.body !== undefined) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options)
      .then(response => {
        if (response.status === 401) {
          this._revokeUserAuthorizationFromStore();

          // TODO: log the response error.
          // Two functions can't call response.json() at the same time.
          response.json().then(response => {
            console.log("RESPONSE", response);
          });
        }
        if (response.status !== 200) {
          console.log("RESPONSE ERROR", url, response);
        }
        return response;
      })
      .catch(error => {
        console.log(error);
        store.dispatch(actions.setIsServerDown(true));
      });
  }

  /**
   * This method returns the response from various API calls as a promise
   */
  static makeAPICall(endpoint, input, options = {}) {
    switch (endpoint) {
      case RULES:
        return this._addAuthorization(this.urlBeginning + "rules" + this.json);
      // case CHILDREN:
      //   return this.urlBeginning + "children/";
      case FAMILY:
        return this._addAuthorization(this.urlBeginning + "family/" + input + this.json);
      case CODE_DESCRIPTION:
        return this._addAuthorization(this.urlBeginning + "codeDescription/" + input + this.json);
      // case REQUEST_RULES:
      //   return this.urlBeginning + "requestRules/";
      case REQUEST_ACTIVE_RULES:
        return this._addAuthorization(
          this.urlBeginning + "requestRulesActive/" + input.codes + this.json + input.age + input.gender
        );
      // case MATCH_DESCRIPTION:
      //   return this.urlBeginning + "matchDescription/";
      case ANCESTORS:
        return this._addAuthorization(this.urlBeginning + "ancestors/" + input + this.json);
      case CODE_AUTO_SUGGESTIONS:
        return this._addAuthorization(this.urlBeginning + "codeAutosuggestions/" + input + this.json);
      case CODE_BLOCK_USAGE:
        return this._addAuthorization(this.urlBeginning + "codeBlockUsage" + this.json);
      case CREATE_RULE:
        return this._addAuthorization(this.urlBeginning + "createRule/", options);
      case RULE_SEARCH:
        return this._addAuthorization(this.urlBeginning + "ruleSearch/", options);
      case FLAG_RULE_FOR_REVIEW:
        return this._addAuthorization(this.urlBeginning + "flagRuleForReview/" + input + this.json, { method: "PUT" });
      case FLAGGED_RULES:
        return this._addAuthorization(this.urlBeginning + "flaggedRules" + this.json);
      case UPDATE_FLAGGED_RULE:
        return this._addAuthorization(this.urlBeginning + "updateFlaggedRule/" + input.id + input.action, {
          method: "PUT"
        });
      case DAGGER_ASTERISK:
        return this._addAuthorization(this.urlBeginning + "daggerAsterisk/" + input + this.json);
      case ENTER_LOG:
        return this._addAuthorization(this.urlBeginning + "enterLog/", options);
      case RULE_STATUS:
        return this._addAuthorization(this.urlBeginning + "changeRuleStatus/", options);
      case INACTIVE_RULES:
        return this._addAuthorization(this.urlBeginning + "inactiveRules" + this.json);
      case STATS:
        return this._addAuthorization(this.urlBeginning + "stats" + this.json);
      case CHECK_CODE:
        return this._addAuthorization(this.urlBeginning + "checkCode/" + input + this.json);
      case GET_TOKEN:
        if (options.body === undefined) {
          options.body = {};
        }
        options.body.client_id = process.env.REACT_APP_CLIENT_ID;
        return this._fetchFromAPI(this.authUrlBeginning + "token/", options);
      case CREATE_USER:
        return this._fetchFromAPI(this.urlBeginning + "createUser/", options);
      case LIST_UNVERIFIED_ACCOUNTS:
        return this._addAuthorization(this.urlBeginning + "unverifiedAccounts" + this.json);
      case APPROVE_USER:
        console.log(options);
        return this._addAuthorization(this.urlBeginning + "approveUser/", options);
      case REJECT_USER:
        return this._addAuthorization(this.urlBeginning + "rejectUser/" + input, options);
      case VALIDATE_TOKEN:
        return this._addAuthorization(this.urlBeginning + "validateToken/");
      case FORGOT_PASSWORD:
        return this._fetchFromAPI(this.urlBeginning + "password_reset/", options);
      case RESET_PASSWORD:
        return this._fetchFromAPI(this.urlBeginning + "password_reset/confirm", options);
      case UPLOAD_DOCUMENT:
        return this._addAuthorization(this.urlBeginning + "uploadDoc/", options);
      case GET_SECTIONS:
        return this._addAuthorization(this.urlBeginning + "getSections/");
      default:
        return null;
    }
  }
}
