import { Component } from '@stencil/core';
import { signIn, getRedirectResult } from '../../helpers/auth'

@Component({
    tag: 'sign-in',
    styleUrl: 'sign-in.css'
})
export class SignIn {

    componentWillLoad() {
        console.log('Component has been rendered');
        return getRedirectResult()
            .then(result => {
                console.log(result.user);
            })
    }

    login() {
        signIn()
    }

    render() {
        return [
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-title>Login</ion-title>
                </ion-toolbar>
            </ion-header>,

            <ion-content padding>
                <p>Welcome to the IMessenger Lite.</p>

                <ion-button expand="block" onClick={() => this.login()}>Sign In</ion-button>
            </ion-content>
        ];
    }
}
