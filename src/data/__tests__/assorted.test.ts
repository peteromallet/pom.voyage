import { describe, it, expect } from 'vitest';
import {
  ACCOUNTABILITY_COMMITMENTS,
  ASSORTED_DIRECTORY_ITEMS,
  CRYPTO_CONVERSATIONS,
  CONVERSATION_DETAILS,
  PROJECTS,
} from '../assorted-content';

describe('assorted data exports', () => {
  it('defines assorted directory items', () => {
    expect(ASSORTED_DIRECTORY_ITEMS.length).toBeGreaterThan(0);
  });

  it('defines accountability commitments', () => {
    expect(ACCOUNTABILITY_COMMITMENTS.length).toBeGreaterThan(0);
  });

  it('defines project entries', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
  });

  it('defines crypto conversation summaries', () => {
    expect(CRYPTO_CONVERSATIONS.length).toBeGreaterThan(0);
  });

  it('CONVERSATION_DETAILS is an object', () => {
    expect(typeof CONVERSATION_DETAILS).toBe('object');
    expect(CONVERSATION_DETAILS).not.toBeNull();
  });

  it('each CONVERSATION_DETAILS entry has title and messages', () => {
    for (const [key, value] of Object.entries(CONVERSATION_DETAILS)) {
      expect(typeof key).toBe('string');
      expect(typeof value.title).toBe('string');
      expect(value.title.length).toBeGreaterThan(0);
      expect(value.messages.length).toBeGreaterThan(0);
    }
  });
});
