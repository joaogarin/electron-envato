import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Inject} from 'angular2/core';

import {Actions} from './../actions';
// Or in the renderer process.
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

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

    handleEnvatoCallback(url) {
        console.log(url);
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

    requestToken(authOptions, authCode) {
        let creds = "grant_type=authorization_code" + "&code=" + authCode + "&client_id=" + authOptions.client_id + "&client_secret=" + authOptions.client_secret;

        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        //headers.append('Authorization', 'Bearer' + authCode);
        
        let request_url = 'https://api.envato.com/token?' + creds; 

        this.http.post(request_url, '', { headers: headers })
            .subscribe(
            response => {
                //call the store to update the authToken
                console.log(response);
                //let body_object = JSON.parse(response['_body']);
                //this.requestUserData(body_object.access_token);
            },
            err => console.log(err),
            () => console.log('Authentication Complete')
            );

    }
    
    requestUserData(token){
        //set the token
        this.appStore.dispatch(this.actions.auth(token));
        
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer' + token);

        this.http.get('https://api.envato.com/user?access_token=' + token, { headers: headers })
            .subscribe(
            response => {
                //call the store to update the authToken
                let body_object = JSON.parse(response['_body']);
                this.appStore.dispatch(this.actions.change_name(body_object.name));
            },
            err => console.log(err),
            () => console.log('Request Complete')
            );
    }

}