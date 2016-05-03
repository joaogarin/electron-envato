/**
 * Include angular2 dependencies including HTTP dependencies
 * and Injectable and Inject
 */
import {Injectable, Inject} from '@angular/core';
import {Http, Headers} from '@angular/http';

/**
 * Include action representations from our list of actions to dispatch
 */
import {Actions} from './../actions';

/**
 * Include electron browser so that a new windows can be triggered for auth
 * Information about browserWindow on electron
 * https://github.com/electron/electron/blob/master/docs/api/browser-window.md
 */
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

/**
 * Basic configuration like Endpoint URL's, API version..
 */
const options = require('./../config.json');

@Injectable()
export class Authentication {
  authWindow: any;
  http: Http;

  //Inject the store to make sure state changes go through the store
  constructor( @Inject('AppStore') private appStore, private actions: Actions, http: Http) {
    //authenticate and call the store to update the token
    this.authWindow = new BrowserWindow({ width: 800, height: 600, show: false });
    this.http = http;
  }

  /**
   * Fires the Envato Auth process by calling the envato api with
   * https://api.envato.com/authorization?response_type=code
   *
   * Listens to specific redirects ont he BrowserWindow object to handle the callback from envato
   * On will-navigate and did-get-redirect-request methods invocation will call the handleGitHubCallback(url)
   * with the url to make sure a code was received
   *
   * OnClose will reset the browserWindow object
   */
  envatoHandShake() {

    // Build the OAuth consent page URL
    let envatoUrl = 'https://api.envato.com/authorization?response_type=code';
    let authUrl = envatoUrl + '&client_id=' + options.envato.client_id + '&redirect_uri=' + options.envato.redirect_uri;
    this.authWindow.loadUrl(authUrl);
    this.authWindow.show();

    // Handle the response
    this.authWindow.webContents.on('will-navigate', (event, url) => {
      this.handleEnvatoCallback(url);
    });

    this.authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      this.handleEnvatoCallback(newUrl);
    });

    // Reset the authWindow on close
    this.authWindow.on('close', function() {
      this.authWindow = null;
    }, false);
  }

  /**
   * Handles the callback from the browserWindow object
   * Checks for a code in the url and a refresh token received. When token and refresh
   * token are received calls requestToken
   *
   * @param {string} url
   * The url that was just called by one of the events :
   * will-navigate
   * did-get-redirect-request
   *
   */
  handleEnvatoCallback(url) {
    let raw_code = /code=([^&]*)/.exec(url) || null;
    let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    let error = /\?error=(.+)$/.exec(url);

    if (code || error) {
      // Close the browser if code found or error
      this.authWindow.destroy();
    }

    // If there is a code, proceed to get token
    if (code) {
      this.requestToken(options.envato, code);
    } else if (error) {
      alert('Oops! Something went wrong and we couldn\'t' +
        'log you in. Please try again.');
    }
  }

  /**
   * Requests a token from the envato api given the
   * code received in the authentication step before
   *
   * @param {Object} authOptions
   * The options to be sent to this request (received from the config file)
   *
   * @param {string} authCode
   * The code received by the authentication method
   */
  requestToken(authOptions, authCode) {
    let creds = "grant_type=authorization_code" + "&code=" + authCode + "&client_id=" + authOptions.client_id + "&client_secret=" + authOptions.client_secret;

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    //headers.append('Authorization', 'Bearer' + authCode);

    let request_url = 'https://api.envato.com/token';

    this.http.post(request_url, creds, { headers: headers })
      .subscribe(
      response => {
        //call the store to update the authToken
        let body_object = JSON.parse(response['_body']);
        this.requestUserData(body_object.access_token);
      },
      err => console.log(err),
      () => console.log('Authentication Complete')
      );

  }

  /**
   * API Request to get information of a user from the Envato API
   *
   * @param {string} token
   * The token to be used in the request as a bearer authentication header
   */
  requestUserData(token) {
    //set the token
    this.appStore.dispatch(this.actions.auth(token));

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Authorization', 'Bearer ' + token);

    this.http.get('https://api.envato.com/v1/market/private/user/account.json', { headers: headers })
      .subscribe(
      response => {
        //call the store to update the authToken
        let body_object = JSON.parse(response['_body']);
        console.log(body_object);
        this.appStore.dispatch(this.actions.change_name(body_object.account.firstname + " " + body_object.account.surname));
      },
      err => console.log(err),
      () => console.log('Request Complete')
      );
  }

}
