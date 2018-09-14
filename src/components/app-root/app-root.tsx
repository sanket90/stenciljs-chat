import { Component, Prop, Listen, State } from '@stencil/core';
import { authStateListener } from '../../helpers/auth';
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
  @Prop() history: RouterHistory

  @State() isLoggedin = false
  @State() loggedInUser = {}

  /**
   * Handle service worker updates correctly.
   * This code will show a toast letting the
   * user of the PWA know that there is a
   * new version available. When they click the
   * reload button it then reloads the page
   * so that the new service worker can take over
   * and serve the fresh content
   */
  @Listen('window:swUpdate')
  async onSWUpdate() {
    const toast = await this.toastCtrl.create({
      message: 'New version available',
      showCloseButton: true,
      closeButtonText: 'Reload'
    });
    await toast.present();
    await toast.onWillDismiss();
    window.location.reload();
  }

  componentWillLoad() {
    authStateListener()
      .subscribe(user => {
        this.isLoggedin = !!user;
        this.loggedInUser = user;
        console.log(!!user);
      })
  }

  componentDidUnload() {
    console.log('Component removed from the DOM');
    
  }

  render() {
    return (
      <ion-app>
        <stencil-router root="/">
          <stencil-route-switch scrollTopOffset={0}>
            <stencil-route url="/" component="app-home" exact={true} />
            <stencil-route url="/profile/:name" component="app-profile" />
            <stencil-route url="/chat" component="chat-room" />
            <stencil-route url="/login" component="sign-in" />
            <stencil-route-redirect url={this.isLoggedin ? '/' : '/login'} />
          </stencil-route-switch>
        </stencil-router>
      </ion-app>
    );
  }
}
