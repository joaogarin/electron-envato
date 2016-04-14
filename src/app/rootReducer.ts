/**
 * Import Actions definitions
 */
import * as Actions from './actions';

/**
 * Define an initial state for our app
 */
const initialState = {
    authToken: window.localStorage.getItem('envatoTeamsauthToken') || false,
    authenticated: false,
    username: ''
}

/**
 * Our main reducer function
 * 
 * will receive requests to update state with an action type and its parameters
 * Changes the state always in an immutable way.
 * 
 * @param {Object} state
 * The current state
 * 
 * @param {Object} action
 * The action to be performed
 * 
 * @return state
 * Returns a new instance of the state tree with the action performed on top of it
 */
export function rootReducer(state = initialState, action) {
    switch (action.type) {
        case Actions.AUTH:
            //localStorage.setItem('envatoTeamsauthToken', action.token);
            return Object.assign(state, { authToken: action.token, authenticated: true });
        case Actions.CHANGE_NAME:
            return Object.assign(state, { username: action.username });
        default:
            return state;
    }
}