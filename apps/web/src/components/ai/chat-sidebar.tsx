import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { usePlaygroundStore } from '@/store/use-playground-store';
import { deleteConversationApi } from '@/api/ai-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ChatSidebar() {
  const conversations = usePlaygroundStore((state) => state.conversations);
  const activeConversationId = usePlaygroundStore((state) => state.activeConversationId);
  const createNewConversation = usePlaygroundStore((state) => state.createNewConversation);
  const selectConversation = usePlaygroundStore((state) => state.selectConversation);
  const deleteConversation = usePlaygroundStore((state) => state.deleteConversation);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    await deleteConversationApi(id);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/40 p-3">
      <Button
        onClick={() => createNewConversation()}
        className="w-full justify-start gap-2 shadow-sm font-medium"
        variant="default"
      >
        <Plus className="h-4 w-4" />
        <span>New Chat</span>
      </Button>

      <div className="mt-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Conversations ({conversations.length})
        </div>

        {conversations.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No history yet. Start a new prompt!
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.conversationId === activeConversationId;

            return (
              <div
                key={conv.conversationId}
                onClick={() => selectConversation(conv.conversationId)}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-colors',
                  isActive
                    ? 'bg-accent text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{conv.title}</span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, conv.conversationId)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
