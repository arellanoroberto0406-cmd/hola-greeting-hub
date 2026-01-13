import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  User, 
  Clock, 
  CheckCircle,
  XCircle,
  ChevronLeft,
  Zap,
  Plus,
  X,
  Save
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  useStoreConversations, 
  useConversationMessages, 
  useSendMessage, 
  useMarkMessagesAsRead,
  useCloseConversation,
  ChatConversation 
} from "@/hooks/useChat";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPanelProps {
  storeId: string;
  primaryColor: string;
}

const ChatPanel = ({ storeId, primaryColor }: ChatPanelProps) => {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [message, setMessage] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showCustomReplyDialog, setShowCustomReplyDialog] = useState(false);
  const [newReplyTitle, setNewReplyTitle] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [customReplies, setCustomReplies] = useState<{ title: string; content: string }[]>(() => {
    const saved = localStorage.getItem(`chat_quick_replies_${storeId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useStoreConversations(storeId);
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(selectedConversation?.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  const closeConversation = useCloseConversation();

  // Track previous message count and conversations for notification
  const prevMessagesCountRef = useRef<number>(0);
  const prevConversationsRef = useRef<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Create oscillator for a pleasant notification tone
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Pleasant notification sound (two-tone chime)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Detect new messages from customers (not from store)
  useEffect(() => {
    if (messages.length > 0 && prevMessagesCountRef.current > 0) {
      const newMessagesCount = messages.length - prevMessagesCountRef.current;
      if (newMessagesCount > 0) {
        // Check if the newest message is from a customer
        const latestMessage = messages[messages.length - 1];
        if (latestMessage.sender_type === 'customer') {
          playNotificationSound();
        }
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, playNotificationSound]);

  // Detect new conversations
  useEffect(() => {
    if (conversations.length > 0 && prevConversationsRef.current.length > 0) {
      const currentIds = conversations.map(c => c.id);
      const newConversations = currentIds.filter(id => !prevConversationsRef.current.includes(id));
      if (newConversations.length > 0) {
        playNotificationSound();
      }
    }
    prevConversationsRef.current = conversations.map(c => c.id);
  }, [conversations, playNotificationSound]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when selecting conversation
  useEffect(() => {
    if (selectedConversation && selectedConversation.unread_count > 0) {
      markAsRead.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const messageText = message.trim();
    setMessage("");

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation.id,
        message: messageText,
        senderType: "store",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Default quick replies
  const defaultQuickReplies = [
    { title: "Saludo", content: "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?" },
    { title: "Envío", content: "El tiempo de envío es de 3-5 días hábiles. Te notificaremos cuando tu pedido sea enviado con el número de seguimiento." },
    { title: "Pago", content: "Aceptamos transferencia bancaria, MercadoPago y efectivo al momento de la entrega. ¿Qué método prefieres?" },
    { title: "Stock", content: "Déjame verificar la disponibilidad del producto. Te confirmo en un momento." },
    { title: "Horario", content: "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 hrs. Responderemos tu mensaje lo antes posible." },
    { title: "Agradecimiento", content: "¡Gracias por tu compra! Si tienes alguna duda, no dudes en escribirnos." },
    { title: "Devolución", content: "Tienes 30 días para realizar devoluciones. El producto debe estar en su empaque original y sin uso." },
    { title: "Despedida", content: "¡Fue un placer atenderte! Si necesitas algo más, aquí estaremos. ¡Que tengas un excelente día!" },
  ];

  const allQuickReplies = [...defaultQuickReplies, ...customReplies];

  const handleQuickReply = (content: string) => {
    setMessage(content);
    setShowQuickReplies(false);
  };

  const handleAddCustomReply = () => {
    if (!newReplyTitle.trim() || !newReplyContent.trim()) return;
    
    const newReplies = [...customReplies, { title: newReplyTitle.trim(), content: newReplyContent.trim() }];
    setCustomReplies(newReplies);
    localStorage.setItem(`chat_quick_replies_${storeId}`, JSON.stringify(newReplies));
    setNewReplyTitle("");
    setNewReplyContent("");
    setShowCustomReplyDialog(false);
  };

  const handleDeleteCustomReply = (index: number) => {
    const newReplies = customReplies.filter((_, i) => i !== index);
    setCustomReplies(newReplies);
    localStorage.setItem(`chat_quick_replies_${storeId}`, JSON.stringify(newReplies));
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    await closeConversation.mutateAsync(selectedConversation.id);
    setSelectedConversation(null);
  };

  const activeConversations = conversations.filter(c => c.status === 'active');
  const closedConversations = conversations.filter(c => c.status === 'closed');
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Conversations List */}
      <Card className={`${selectedConversation ? 'hidden lg:block' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversaciones
              {totalUnread > 0 && (
                <Badge style={{ backgroundColor: primaryColor }}>{totalUnread}</Badge>
              )}
            </CardTitle>
          </div>
          <CardDescription>
            {activeConversations.length} activas, {closedConversations.length} cerradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Sin conversaciones</p>
                <p className="text-sm text-muted-foreground">
                  Cuando los clientes inicien un chat, aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                          {conversation.customer_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {conversation.customer_name || "Cliente anónimo"}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge className="text-xs" style={{ backgroundColor: primaryColor }}>
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.last_message_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                          {conversation.status === 'closed' && (
                            <Badge variant="secondary" className="text-xs">Cerrada</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                      {selectedConversation.customer_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {selectedConversation.customer_name || "Cliente anónimo"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Desde {format(new Date(selectedConversation.created_at), "d MMM yyyy", { locale: es })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseConversation}
                      disabled={closeConversation.isPending}
                    >
                      {closeConversation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Cerrar chat
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Cerrada
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="p-0 flex flex-col h-[calc(100vh-400px)]">
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <p className="text-sm">Sin mensajes aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender_type === "store" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                              msg.sender_type === "store"
                                ? "rounded-br-md text-white"
                                : "bg-muted rounded-bl-md"
                            }`}
                            style={msg.sender_type === "store" ? { backgroundColor: primaryColor } : undefined}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.sender_type === "store" ? "text-white/70" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              {selectedConversation.status === 'active' && (
                <div className="p-4 border-t space-y-3">
                  {/* Quick Replies */}
                  <div className="flex items-center gap-2">
                    <Popover open={showQuickReplies} onOpenChange={setShowQuickReplies}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Respuestas rápidas
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-3 border-b">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Respuestas rápidas</h4>
                            <Dialog open={showCustomReplyDialog} onOpenChange={setShowCustomReplyDialog}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 gap-1">
                                  <Plus className="h-3 w-3" />
                                  Añadir
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Nueva respuesta rápida</DialogTitle>
                                  <DialogDescription>
                                    Crea una respuesta personalizada para usar en tus conversaciones.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="reply-title">Título</Label>
                                    <Input
                                      id="reply-title"
                                      placeholder="Ej: Promoción especial"
                                      value={newReplyTitle}
                                      onChange={(e) => setNewReplyTitle(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="reply-content">Mensaje</Label>
                                    <Textarea
                                      id="reply-content"
                                      placeholder="Escribe el mensaje de la respuesta..."
                                      value={newReplyContent}
                                      onChange={(e) => setNewReplyContent(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowCustomReplyDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button 
                                    onClick={handleAddCustomReply}
                                    disabled={!newReplyTitle.trim() || !newReplyContent.trim()}
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <ScrollArea className="h-64">
                          <div className="p-2 space-y-1">
                            {allQuickReplies.map((reply, index) => (
                              <div
                                key={`${reply.title}-${index}`}
                                className="group relative"
                              >
                                <button
                                  onClick={() => handleQuickReply(reply.content)}
                                  className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                >
                                  <span className="font-medium text-sm block">{reply.title}</span>
                                  <span className="text-xs text-muted-foreground line-clamp-2">
                                    {reply.content}
                                  </span>
                                </button>
                                {index >= defaultQuickReplies.length && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCustomReply(index - defaultQuickReplies.length);
                                    }}
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                                  >
                                    <X className="h-3 w-3 text-destructive" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs text-muted-foreground">
                      Haz clic para insertar una respuesta predefinida
                    </span>
                  </div>
                  
                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe tu respuesta..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessage.isPending}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <MessageCircle className="h-10 w-10" style={{ color: primaryColor }} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Selecciona una conversación</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Haz clic en una conversación de la lista para ver los mensajes y responder a tus clientes.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatPanel;
