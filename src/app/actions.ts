export const AUTH = 'AUTH';
export const CHANGE_NAME = 'CHANGE_NAME';

export class Actions {
    constructor() {
    }

    auth(token:string) {
        //Authenticate user via the store using the token received from github
        return {
            type: AUTH,
            token: token,
            authenticated: true
        };
    };
    
    change_name(name:string) {
        //Authenticate user via the store using the token received from github
        return {
            type: CHANGE_NAME,
            username: name
        };
    };
}