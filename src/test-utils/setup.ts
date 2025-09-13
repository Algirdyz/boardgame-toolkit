// Vitest setup file
import { beforeAll } from 'vitest';

// Mock DOM APIs that might be needed
beforeAll(() => {
  // Mock window.getComputedStyle if needed
  if (!global.window.getComputedStyle) {
    global.window.getComputedStyle = () => ({}) as CSSStyleDeclaration;
  }

  // Mock HTMLElement.prototype.scrollIntoView if needed
  if (!global.HTMLElement.prototype.scrollIntoView) {
    global.HTMLElement.prototype.scrollIntoView = () => {};
  }
});
