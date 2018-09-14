import { Component, State, Prop } from '@stencil/core';
import { getChats } from '../../helpers/auth';
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {
  @Prop() history: RouterHistory

  @State() conversations : any[] = [];

  componentDidLoad() {
    const that = this
    getChats().subscribe((data:any) => {
      that.conversations = data.recent
    })
    
  }

  componentDidUpdate() {
    console.log('Component did update');
    console.log(this.conversations);
    
  }

  handleConversationClick = (data) => {
    this.history.push({pathname: '/chat', state: data})
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Chats</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content padding>
        <ion-list>
        <ion-list-header>
          <ion-label>Recent Conversations</ion-label>
        </ion-list-header>
          {this.conversations.map(conv => 
              <ion-item >
                <ion-avatar slot="start">
                  <img src={conv.imageUrl}></img>
                </ion-avatar>
                <ion-label>
                  <h2>{conv.name}</h2>
                  <p>{conv.email}</p>
                </ion-label>
                <ion-icon color={conv.status === "online" ? 'success' : 'danger'} name="radio-button-on" slot="end"></ion-icon>

            </ion-item>
          )}
        </ion-list>
      </ion-content>
    ];
  }
}
