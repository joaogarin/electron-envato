/*
 * Providers provided by Angular
 */
import {provide, enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';

// ROUTER
import {ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

// HTTP
import {HTTP_PROVIDERS} from '@angular/http';

// Decorators
import {Component, ViewEncapsulation} from '@angular/core';

/**
 * setup redux
 */
import {createStore} from 'redux';
import {rootReducer} from './rootReducer';
import {Actions} from './actions';
const appStore = createStore(rootReducer);

/**
 * Import our child components
 */
import {LoginComponent} from './components/login';
import {HomeComponent} from './components/home';


/**
 * Import our global css
 * Because this component is set to use encapsulation: ViewEncapsulation.None, the css in here
 * will be global and not scoped in any way.
 */
var page_css = require('./sass/layout/_page.scss');

/*
 * App Component
 * Top Level Component
 */
@Component({
    // The selector is what angular internally uses
    selector: 'ee-app', // <app></app>
    directives: [ROUTER_DIRECTIVES, LoginComponent, HomeComponent],
    encapsulation: ViewEncapsulation.None,
    styles: [`${page_css}`],
    template: `
    <div>
        <router-outlet></router-outlet>
    </div>
    `
})
@RouteConfig([
    { path: '/', component: LoginComponent, name: 'Login' },
    { path: '/login', component: LoginComponent, name: 'Login' },
    { path: '/home', component: HomeComponent, name: 'Home' }
])
export class AppComponent {

}

/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our Services and Providers into Angular's dependency injection
 */
bootstrap(AppComponent, [
    ...HTTP_PROVIDERS,
    ...ROUTER_PROVIDERS,
    provide(LocationStrategy, { useClass: HashLocationStrategy }),
    provide('AppStore', { useValue: appStore }),
    Actions
]);
