import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateConversation, useSendMessage, useConversationMessages } from "@/hooks/useChat";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LiveChatWidgetProps {
  storeId: string;
  storeName: string;
  primaryColor: string;
}

const LiveChatWidget = ({ storeId, storeName, primaryColor }: LiveChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(conversationId || undefined);

  // Load existing conversation from localStorage
  useEffect(() => {
    const savedConversationId = localStorage.getItem(`chat_conversation_${storeId}`);
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    const savedName = localStorage.getItem(`chat_name_${storeId}`);
    if (savedName) {
      setCustomerName(savedName);
    }
  }, [storeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    if (!customerName.trim()) return;
    
    setIsStarting(true);
    try {
      const conversation = await createConversation.mutateAsync({
        storeId,
        customerName: customerName.trim(),
      });
      setConversationId(conversation.id);
      localStorage.setItem(`chat_conversation_${storeId}`, conversation.id);
      localStorage.setItem(`chat_name_${storeId}`, customerName.trim());
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
    setIsStarting(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    const messageText = message.trim();
    setMessage("");

    try {
      await sendMessage.mutateAsync({
        conversationId,
        message: messageText,
        senderType: "customer",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageText); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (conversationId) {
        handleSendMessage();
      } else {
        startConversation();
      }
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="h-7 w-7 text-white" />
            <span 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full animate-ping"
              style={{ backgroundColor: primaryColor }}
            />
            <span 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-background rounded-2xl shadow-2xl border overflow-hidden"
            style={{ height: "500px", maxHeight: "calc(100vh - 120px)" }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{storeName}</h3>
                  <p className="text-xs text-white/80">
                    {conversationId ? "Chat en vivo" : "Iniciar conversación"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Content */}
            {!conversationId ? (
              // Start Conversation Form
              <div className="flex flex-col items-center justify-center h-[calc(100%-64px)] p-6">
                <div className="text-center mb-6">
                  <div 
                    className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <MessageCircle className="h-8 w-8" style={{ color: primaryColor }} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">¡Hola! 👋</h4>
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <Input
                    placeholder="Tu nombre"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                    onClick={startConversation}
                    disabled={!customerName.trim() || isStarting}
                  >
                    {isStarting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Iniciar chat
                  </Button>
                </div>
              </div>
            ) : (
              // Chat Messages
              <>
                <ScrollArea className="flex-1 h-[calc(100%-128px)] p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="text-sm">¡Envía tu primer mensaje!</p>
                      <p className="text-xs mt-1">Te responderemos lo antes posible.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.sender_type === "customer"
                                ? "rounded-br-md text-white"
                                : "bg-muted rounded-bl-md"
                            }`}
                            style={msg.sender_type === "customer" ? { backgroundColor: primaryColor } : undefined}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.sender_type === "customer" ? "text-white/70" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe tu mensaje..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessage.isPending}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;
