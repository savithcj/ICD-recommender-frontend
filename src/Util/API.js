import store from "../Store/configureStore";
import * as actions from "../Store/Actions/index";
import secret from "../secret/secrets.json";
/**
 * Endpoints---------------------------------------------------------------------------
 * Defined as constants here mainly to avoid possible bugs as a result of misspellings
 */
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

/**
 * API class used to connect to the backend
 * Deals with token authorization and all other API calls
 */
export class API {
  static serverAdress = window.location.hostname; //Only if API on same server as React
  static portAdress = ":8000";
  static urlBeginning = "http://" + this.serverAdress + this.portAdress + "/api/";
  static authUrlBeginning = "http://" + this.serverAdress + this.portAdress + "/o/";
  static json = "/?format=json";

  // METHODS DEALING WITH TOKENS---------------------------------------------------------
  //-------------------------------------------------------------------------------------
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
   * Used to revoke the existing token in the local storage
   */
  static revokeToken() {
    const url = this.authUrlBeginning + "revoke_token/";

    const tokenFromLS = this.getTokenFromLS();
    localStorage.setItem("tokenObject", "");

    const data = JSON.stringify({ token: tokenFromLS, client_id: secret.client_id });

    const options = {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: data
    };

    fetch(url, options);
  }

  // METHODS DEALING WITH API CALLS------------------------------------------------------
  //-------------------------------------------------------------------------------------
  /**
   * Method used to add the authorization token from the local storage before making
   * the API call.
   */
  static addAuthorization(url, options = {}) {
    const oAuthToken = this.getTokenFromLS();

    // let bearer_token = "API TOKEN HERE";
    // let bearer_token = "dAPt5viF6Hzbrobi5B99tCtaG3cQPu";
    let bearer = "Bearer " + oAuthToken;

    // Append token to header. Create header if it does not exist
    if (options.headers === undefined) {
      options.headers = {};
    }
    options.headers["Authorization"] = bearer;
    return this.fetchFromAPI(url, options);
  }

  /**
   * This method makes the API call and returns the API response as promise
   * If the token is expired, updates the corresponding flag in the store
   * If the server is not responding, updates the corresponding flag in the store
   */
  static fetchFromAPI(url, options = {}) {
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
          store.dispatch(actions.setIsAuthorized(false));
          store.dispatch(actions.setUserRole(null));
          console.log("RESPONSE ERROR, STATUS", response.status);
          // TODO: log the response error.
          // Two functions can't call response.json() at the same time.
          // response.json().then(response => {
          //   console.log("RESPONSE", response);
          // });
        }
        return response;
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * This method returns the response from various API calls as a promise
   */
  static makeAPICall(endpoint, input, options = {}) {
    switch (endpoint) {
      case RULES:
        return this.addAuthorization(this.urlBeginning + "rules" + this.json);
      // case CHILDREN:
      //   return this.urlBeginning + "children/";
      case FAMILY:
        return this.addAuthorization(this.urlBeginning + "family/" + input + this.json);
      case CODE_DESCRIPTION:
        return this.addAuthorization(this.urlBeginning + "codeDescription/" + input + this.json);
      // case REQUEST_RULES:
      //   return this.urlBeginning + "requestRules/";
      case REQUEST_ACTIVE_RULES:
        return this.addAuthorization(
          this.urlBeginning + "requestRulesActive/" + input.codes + this.json + input.age + input.gender
        );
      // case MATCH_DESCRIPTION:
      //   return this.urlBeginning + "matchDescription/";
      case ANCESTORS:
        return this.addAuthorization(this.urlBeginning + "ancestors/" + input + this.json);
      case CODE_AUTO_SUGGESTIONS:
        return this.addAuthorization(this.urlBeginning + "codeAutosuggestions/" + input + this.json);
      case CODE_BLOCK_USAGE:
        return this.addAuthorization(this.urlBeginning + "codeBlockUsage" + this.json);
      case CREATE_RULE:
        return this.addAuthorization(this.urlBeginning + "createRule/", options);
      case RULE_SEARCH:
        return this.addAuthorization(this.urlBeginning + "ruleSearch/", options);
      case FLAG_RULE_FOR_REVIEW:
        return this.addAuthorization(this.urlBeginning + "flagRuleForReview/" + input + this.json, { method: "PUT" });
      case FLAGGED_RULES:
        return this.addAuthorization(this.urlBeginning + "flaggedRules" + this.json);
      case UPDATE_FLAGGED_RULE:
        return this.addAuthorization(this.urlBeginning + "updateFlaggedRule/" + input.id + input.action, {
          method: "PUT"
        });
      case DAGGER_ASTERISK:
        return this.addAuthorization(this.urlBeginning + "daggerAsterisk/" + input + this.json);
      case ENTER_LOG:
        return this.addAuthorization(this.urlBeginning + "enterLog/", options);
      case RULE_STATUS:
        return this.addAuthorization(this.urlBeginning + "changeRuleStatus/", options);
      case INACTIVE_RULES:
        return this.addAuthorization(this.urlBeginning + "inactiveRules" + this.json);
      case STATS:
        return this.addAuthorization(this.urlBeginning + "stats" + this.json);
      case CHECK_CODE:
        return this.addAuthorization(this.urlBeginning + "checkCode/" + input + this.json);
      case GET_TOKEN:
        if (options.body === undefined) {
          options.body = {};
        }
        options.body.client_id = secret.client_id;
        return this.fetchFromAPI(this.authUrlBeginning + "token/", options);
      case CREATE_USER:
        return this.fetchFromAPI(this.urlBeginning + "createUser/", options);
      case LIST_UNVERIFIED_ACCOUNTS:
        return this.addAuthorization(this.urlBeginning + "unverifiedAccounts" + this.json);
      case APPROVE_USER:
        console.log(options);
        return this.addAuthorization(this.urlBeginning + "approveUser/", options);
      case REJECT_USER:
        return this.addAuthorization(this.urlBeginning + "rejectUser/" + input, options);
      case VALIDATE_TOKEN:
        return this.addAuthorization(this.urlBeginning + "validateToken/");
      default:
        return null;
    }
  }
}
