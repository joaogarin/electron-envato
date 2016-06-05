/**
 * Import decorators and services from angular
 */
import {Component, Inject} from '@angular/core';

@Component({
    selector: 'ee-home',
    template: `
    <div>
       <h1>{{name}}</h1>
       <input [(ngModel)]='name' />
    </div>
    `
})
export class HomeComponent {
    name: string;

    constructor( @Inject('AppStore') private appStore) {
        let state = this.appStore.getState();
        this.name = state.username;
    }
}
