import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { ChatHeader } from '@/components/ai/chat-header';
import { ChatSidebar } from '@/components/ai/chat-sidebar';
import { ChatEmptyState } from '@/components/ai/chat-empty-state';
import { ChatMessagesList } from '@/components/ai/chat-messages-list';
import { ChatInput } from '@/components/ai/chat-input';
import { usePlaygroundStore } from '@/store/use-playground-store';
import { sendChatMessage, ChatMessage } from '@/api/ai-api';

export function AiPlaygroundPage() {
  const activeConversationId = usePlaygroundStore((state) => state.activeConversationId);
  const getActiveConversation = usePlaygroundStore((state) => state.getActiveConversation);
  const createNewConversation = usePlaygroundStore((state) => state.createNewConversation);
  const addMessage = usePlaygroundStore((state) => state.addMessage);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages || [];

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      addMessage(data.conversationId, assistantMsg);
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || 'An error occurred while connecting to the AI provider.');
    },
  });

  const handleSendMessage = (messageText: string) => {
    setErrorMessage(null);

    let targetConvId = activeConversationId;
    if (!targetConvId) {
      targetConvId = createNewConversation();
    }

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    addMessage(targetConvId, userMsg);

    chatMutation.mutate({
      conversationId: targetConvId,
      message: messageText,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <ChatSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />

        {errorMessage && (
          <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <main className="flex flex-1 flex-col overflow-hidden">
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={handleSendMessage} />
          ) : (
            <ChatMessagesList messages={messages} isLoading={chatMutation.isPending} />
          )}

          <ChatInput onSendMessage={handleSendMessage} disabled={chatMutation.isPending} />
        </main>
      </div>
    </div>
  );
}
