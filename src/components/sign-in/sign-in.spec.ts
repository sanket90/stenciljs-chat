import { TestWindow } from '@stencil/core/testing';
import { SignIn } from './sign-in';

describe('sign-in', () => {
  it('should build', () => {
    expect(new SignIn()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLSignInElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [SignIn],
        html: '<sign-in></sign-in>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});
