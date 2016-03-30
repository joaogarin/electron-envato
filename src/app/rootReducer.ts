import * as Actions from './actions';

const initialState = {
    authToken: window.localStorage.getItem('envatoTeamsauthToken') || false,
    authenticated: false,
    username: ''
}

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