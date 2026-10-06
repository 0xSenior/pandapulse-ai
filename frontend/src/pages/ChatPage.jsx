import React from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';

export const ChatPage = ({ initialPrompt = '', onClearInitialPrompt }) => {
  return (
    <div className="w-full pt-3 pb-3">
      <ChatContainer initialPrompt={initialPrompt} onClearInitialPrompt={onClearInitialPrompt} />
    </div>
  );
};
