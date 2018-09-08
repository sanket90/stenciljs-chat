import { TestWindow } from '@stencil/core/testing';
import { ChatRoom } from './chat-room';

describe('chat-room', () => {
  it('should build', () => {
    expect(new ChatRoom()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLChatRoomElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [ChatRoom],
        html: '<chat-room></chat-room>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
