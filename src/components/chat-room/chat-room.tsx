import { Component, Prop, State } from '@stencil/core';
import { toChatRoom, sendMessage } from '../../helpers/auth';
import { RouterHistory } from '@stencil/router';

@Component({
    tag: 'chat-room',
    styleUrl: 'chat-room.css'
})
export class ChatRoom {
    @Prop() history: RouterHistory

    @State() message: string = "";
    @State() messages: any[] = [];
    @State() conv: any;
    @State() currentUid: any;

    handleMessage(event) {
        this.message = event.target.value
    }

    handleSendMessage() {
        
        if (!this.currentUid || !this.conv || !this.conv.convId || !this.message) return

        sendMessage({
            "text": this.message,
            "sender": this.currentUid,
        }, this.conv)
        this.message = "";
    }

    componentWillLoad() {
        toChatRoom(this.history.location.state.uid)
            .subscribe((data: any) => {
                this.messages = data.msgs
                this.conv = data.conv
                if (data.conv) this.currentUid = data.conv.uid1
            })
    }

    render() {
        return [
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-buttons slot="start">
                        <ion-back-button defaultHref="/" />
                    </ion-buttons>
                    <ion-title>{this.history.location.state.name}</ion-title>
                </ion-toolbar>
            </ion-header>,

            <ion-content>
                <ion-list>

                    {this.messages.map(chat => {
                        if (this.currentUid === chat.sender) {
                            return <ion-item no-lines>
                                <div class="chat-message" text-right>
                                    <div class="right-bubble">
                                        <span class="msg-date">{chat.sendDate}</span>
                                        <p text-wrap>{chat.text}</p>
                                    </div>
                                </div>
                            </ion-item>
                        } else {
                            return <ion-item no-lines>
                                <div class="chat-message" text-left>
                                    <div class="left-bubble">
                                        <span class="msg-date">{chat.sendDate}</span>
                                        <p text-wrap>{chat.text}</p>
                                    </div>
                                </div>
                            </ion-item>
                        }
                    })}

                </ion-list>
            </ion-content>,

            <ion-footer>
                <ion-grid>
                    <ion-row>
                        <ion-col size="10">
                            <ion-input type="text" placeholder="Type a message" name="message" value={this.message} onInput={(event) => this.handleMessage(event)}></ion-input>
                        </ion-col>
                        <ion-col size="2">
                            <ion-icon name="paper-plane" onClick={() => this.handleSendMessage()}></ion-icon>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-footer>
        ];
    }
}
