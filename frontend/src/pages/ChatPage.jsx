import React from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';

export const ChatPage = ({ initialPrompt = '', onClearInitialPrompt }) => {
  return (
    <div className="w-full h-full flex flex-col py-1">
      <ChatContainer initialPrompt={initialPrompt} onClearInitialPrompt={onClearInitialPrompt} />
    </div>
  );
};
