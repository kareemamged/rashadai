import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit, User, Bot, Paperclip, Mic, Square, Check,
  MessageSquare, ChevronLeft, ChevronRight, Calendar, Plus, Search, X, Menu, Bookmark } from 'lucide-react';
import { useConsultationStore } from '../store/consultationStore';
import { useAuthStore } from '../store/authStore';
import { useChatHistoryStore } from '../store/chatHistoryStore';
import { useSavedMessagesStore } from '../store/savedMessagesStore';
import TypingEffect from '../components/TypingEffect';
import ChatHeader from '../components/ChatHeader';
import { useTranslation } from 'react-i18next';

// Extend MediaRecorder type to include our timer interval
interface ExtendedMediaRecorder extends MediaRecorder {
  timerInterval?: NodeJS.Timeout;
}

const Chat = () => {
  const {
    messages,
    isLoading,
    isTyping,
    typingMessage,
    sendMessage,
    completeTyping,
    stopTyping
  } = useConsultationStore();
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Interactive button states
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);

  // Saved messages store
  const { addMessage, isMessageSaved } = useSavedMessagesStore();

  // File attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<ExtendedMediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Chat history sidebar states - explicitly set to false to ensure it's hidden by default
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { chatSessions, currentChatId, addChat, loadChat, deleteChat } = useChatHistoryStore();

  // Ensure sidebar is hidden on initial load and update language when it changes
  useEffect(() => {
    setShowSidebar(false);
  }, []);

  // Update language when i18n language changes
  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  // دالة لمعالجة اختيار الملفات
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // دالة لإزالة ملف مرفق
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat from URL parameter if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('id');

    if (chatId) {
      // Load the chat
      loadChat(chatId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading || isTyping) return;

    try {
      await sendMessage(input, attachments);

      // Save to chat history if this is the first message
      if (messages.length === 0) {
        // Create a new chat entry
        const title = input.length > 30 ? `${input.substring(0, 30)}...` : input;
        addChat(title, input, [
          {
            id: Date.now().toString(),
            content: input,
            isAi: false,
            timestamp: new Date(),
            attachments: attachments.length > 0 ? [...attachments] : undefined
          }
        ]);
      } else if (currentChatId) {
        // Update existing chat
        const allMessages = [...messages, {
          id: Date.now().toString(),
          content: input,
          isAi: false,
          timestamp: new Date(),
          attachments: attachments.length > 0 ? [...attachments] : undefined
        }];

        useChatHistoryStore.getState().updateChat(currentChatId, {
          preview: input,
          messageCount: allMessages.length,
          messages: allMessages
        });
      }

      setInput('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(
        language === 'ar'
          ? 'خطأ أثناء إرسال الرسالة: '
          : 'Error sending message:',
        error
        
      );
    }
  };

  // Update chat history when AI completes typing
  useEffect(() => {
    // When typing is complete and we have messages
    if (!isTyping && messages.length > 0 && currentChatId) {
      // Get the last message (which should be the AI response)
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.isAi) {
        // Update the chat history with the new message count
        useChatHistoryStore.getState().updateChat(currentChatId, {
          messageCount: messages.length,
          messages: [...messages]
        });
      }
    }
  }, [isTyping, messages, currentChatId]);

  // دالة للتعامل مع زر الإعجاب
  const handleLike = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // إزالة الرسالة من قائمة عدم الإعجاب إذا كانت موجودة
        setDislikedMessages(prevDislikes => {
          const newDislikes = new Set(prevDislikes);
          newDislikes.delete(messageId);
          return newDislikes;
        });
      }
      return newSet;
    });
  };

  // دالة للتعامل مع زر عدم الإعجاب
  const handleDislike = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // إزالة الرسالة من قائمة الإعجاب إذا كانت موجودة
        setLikedMessages(prevLikes => {
          const newLikes = new Set(prevLikes);
          newLikes.delete(messageId);
          return newLikes;
        });
      }
      return newSet;
    });
  };

  // دالة محسنة للنسخ مع تأثير بصري
  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000); // إعادة أيقونة النسخ بعد ثانيتين
    });
  };

  // دالة لحفظ الرسالة
  const handleSaveMessage = (message: any) => {
    if (!message || !message.id || !message.content) return;

    // إضافة الرسالة إلى المخزن
    addMessage({
      id: message.id,
      content: message.content,
      timestamp: new Date(),
      source: 'Chat'
    });

    // عرض تأكيد بصري
    setSavedMessageId(message.id);
    setTimeout(() => {
      setSavedMessageId(null);
    }, 2000);
  };

  const handleEdit = (message: any) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 0);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editingMessageId === null) return;

    try {
      await sendMessage(editText);
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error(
        language === 'ar'
          ? 'خطأ أثناء تحديث الرسالة: '
          : 'Error updating message:',
        error
        
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleRegenerate = async (userMessageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === userMessageId);
    if (messageIndex === -1) return;

    const userMessage = messages[messageIndex];

    try {
      await sendMessage(userMessage.content);
    } catch (error) {
      console.error(
        language === 'ar'
          ? 'خطأ أثناء إعادة إنشاء الاستجابة: '
          : 'Error regenerating response:',
        error
        
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoGrowTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      setAudioBlob(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);

        // Convert to file and add to attachments
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
          type: 'audio/webm'
        });

        setAttachments(prev => [...prev, audioFile]);

        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      const timerInterval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store interval ID for cleanup
      mediaRecorderRef.current.timerInterval = timerInterval;

    } catch (error) {
      console.error(
        language === 'ar'
          ? 'خطأ أثناء بدء التسجيل: '
          : 'Error starting recording:',
        error
        
      );
      alert(
        language === 'ar'
          ? 'لا يمكن الوصول إلى الميكروفون. يرجى التحقق من أذونات المتصفح الخاص بك.'
          : 'Could not access microphone. Please check your browser permissions.'
        
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Stop recording
      mediaRecorderRef.current.stop();

      // Clear timer
      if (mediaRecorderRef.current.timerInterval) {
        clearInterval(mediaRecorderRef.current.timerInterval);
      }

      setIsRecording(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Chat history sidebar functions with improved toggle
  const toggleSidebar = () => {
    // Add a small animation to the toggle button when clicked
    const toggleButton = document.querySelector('.sidebar-toggle');
    if (toggleButton) {
      toggleButton.classList.add('animate-pulse');
      setTimeout(() => {
        toggleButton.classList.remove('animate-pulse');
      }, 300);
    }

    setShowSidebar(!showSidebar);
  };

  const handleChatSelect = (chatId: string) => {
    // Make sure any ongoing typing is completed
    completeTyping();
    stopTyping();

    // Load the selected chat
    loadChat(chatId);

    // Show a custom popup notification instead of alert
    const selectedChat = chatSessions.find(chat => chat.id === chatId);
    if (selectedChat) {
      // Create popup element
      const popup = document.createElement('div');
      popup.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center';

      // Set direction based on language
      popup.dir = language === 'ar' ? 'rtl' : 'ltr';

      popup.innerHTML = `
        <div class="${language === 'ar' ? 'ml-2' : 'mr-2'}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <span>${language === 'ar' ? 'تم تحميل المحادثة' : 'Conversation loaded'}</span>
        <button class="ml-3 text-white hover:text-blue-100" id="close-popup">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      document.body.appendChild(popup);

      // Add animation
      popup.style.opacity = '0';
      popup.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { popup.style.opacity = '1'; }, 10);

      // Add close button functionality
      const closeButton = popup.querySelector('#close-popup');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          popup.style.opacity = '0';
          setTimeout(() => { document.body.removeChild(popup); }, 300);
        });
      }

      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (document.body.contains(popup)) {
          popup.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(popup)) {
              document.body.removeChild(popup);
            }
          }, 300);
        }
      }, 3000);
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  const filteredChatHistory = chatSessions.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Chat header with assistant info */}
      <ChatHeader />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat history sidebar overlay with fade animation and higher z-index */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-500 ease-in-out z-40 ${
            showSidebar ? 'opacity-30' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        ></div>

        {/* Chat history sidebar - full height from top of page with higher z-index */}
        <div className={`fixed top-0 bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} bg-white ${language === 'ar' ? 'border-l' : 'border-r'} border-gray-200 w-80 flex-shrink-0 transition-all duration-500 ease-in-out transform shadow-lg z-50 ${
          showSidebar
            ? 'opacity-100 ' + (language === 'ar' ? 'translate-x-0' : 'translate-x-0')
            : 'opacity-0 ' + (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
        } h-full`}>
          <div className="flex flex-col h-full">
            {/* Sidebar header - styled like main header */}
            <div className="bg-white shadow-sm py-4 px-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className={`${language === 'ar' ? 'ml-3' : 'mr-3'} text-gray-500 hover:text-gray-700`}
                >
                  {language === 'ar' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
                <div className="flex items-center">
                  <MessageSquare className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-blue-600`} />
                  <h2 className="text-lg font-semibold text-gray-800">{language === 'ar' ? 'سجل المحادثات' : 'Chat History'}</h2>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'ar' ? "البحث في المحادثات..." : "Search conversations..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* New chat button */}
            <div className="p-3 border-b border-gray-200">
              <button
                onClick={() => {
                  // Clear current messages and start a new chat
                  completeTyping();
                  stopTyping();
                  useConsultationStore.setState({
                    messages: [],
                    isLoading: false,
                    isTyping: false
                  });

                  // Close sidebar
                  setShowSidebar(false);
                }}
                className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? 'محادثة جديدة' : 'New Conversation'}
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
              {filteredChatHistory.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredChatHistory.map((chat) => (
                    <li
                      key={chat.id}
                      onClick={() => handleChatSelect(chat.id)}
                      className={`hover:bg-gray-50 cursor-pointer ${currentChatId === chat.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{chat.title}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className={`h-3 w-3 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                            {formatDate(chat.date)}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">{chat.preview}</p>
                        <div className="mt-1 flex items-center">
                          <MessageSquare className={`h-3 w-3 text-gray-400 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                          <span className="text-xs text-gray-400">
                            {language === 'ar'
                              ? `${chat.messageCount} ${chat.messageCount === 1 ? 'رسالة' : chat.messageCount === 2 ? 'رسالتان' : 'رسائل'}`
                              : `${chat.messageCount} ${chat.messageCount === 1 ? 'message' : 'messages'}`
                            }
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {language === 'ar' ? 'لم يتم العثور على محادثات' : 'No conversations found'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toggle sidebar button - positioned at top corner with highest z-index */}
          <button
            onClick={toggleSidebar}
            className={`sidebar-toggle fixed ${language === 'ar' ? 'right-4' : 'left-4'} top-20 z-60 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105`}
            aria-label="Toggle chat history"
            title={language === 'ar' ? 'سجل المحادثات' : 'Chat History'}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">{language === 'ar' ? 'سجل المحادثات' : 'Chat History'}</span>
          </button>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && !isTyping && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Bot className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'ar' ? 'مرحبًا بك في الاستشارة الطبية' : 'Welcome to Medical Consultation'}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              {language === 'ar'
                ? 'أنا مساعدك الطبي بالذكاء الاصطناعي. يرجى وصف الأعراض أو طرح أي أسئلة متعلقة بالصحة.'
                : "I'm your AI medical assistant. Please describe your symptoms or ask any health-related questions."
              }
            </p>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full`}>
              {(language === 'ar' ? [
                "ما هي أعراض كوفيد-19؟",
                "لدي صداع مستمر منذ 3 أيام",
                "ما الذي يسبب ارتفاع ضغط الدم؟",
                "كيف يمكنني تحسين جودة النوم؟"
              ] : [
                "What are the symptoms of COVID-19?",
                "I have a persistent headache for 3 days",
                "What causes high blood pressure?",
                "How can I improve my sleep quality?"
              ]).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors ltr:text-left rtl:text-right"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isAi ? 'justify-start' : 'justify-end'} group`}
            // إزالة أحداث onMouseEnter و onMouseLeave
          >
            <div className={`flex items-start max-w-[85%] md:max-w-[75%] ${message.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.isAi ? 'mr-3' : 'ml-3'} mt-1`}>
                <div className={`${language === 'ar' ? 'mx-2' : ''} rounded-full flex items-center justify-center w-8 h-8 ${
                  message.isAi ? 'bg-blue-100' : 'bg-blue-600'
                }`}>
                  {message.isAi ?
                    <Bot className="h-5 w-5 text-blue-600" /> :
                    <User className="h-5 w-5 text-white" />
                  }
                </div>
              </div>

              {/* Message content */}
              <div className="flex flex-col">
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.isAi
                      ? 'bg-white border border-gray-200 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="flex flex-col space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => {
                          setEditText(e.target.value);
                          autoGrowTextArea(e);
                        }}
                        className="w-full p-2 text-gray-800 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        ref={inputRef}
                      />
                      <div className={`flex ${language === 'ar' ? 'justify-start space-x-reverse' : 'justify-end'} space-x-2`}>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm whitespace-pre-wrap ${message.isAi ? 'text-gray-800' : 'text-white'}`}>
                        {message.content}
                      </p>
                      <span className={`text-xs ${message.isAi ? 'text-gray-500' : 'text-blue-100'} mt-1 block text-right`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>

                {/* عرض المرفقات في الرسائل */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative border rounded-md overflow-hidden"
                      >
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.preview || attachment.url}
                            alt={attachment.name}
                            className="h-24 w-auto object-cover"
                          />
                        ) : (
                          <div className="flex items-center p-2 bg-gray-100">
                            <Paperclip className="w-4 h-4 mr-2" />
                            <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message actions - always visible with improved UI/UX */}
                <div className={`flex mt-2 ${language === 'ar' ? 'space-x-reverse' : ''} space-x-1 ${message.isAi ? 'justify-start' : 'justify-end'}`}>
                  {message.isAi ? (
                    <>
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className={`p-1.5 bg-white rounded-full shadow-sm transition-all duration-300 transform hover:scale-110 ${
                          copiedMessageId === message.id
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={copiedMessageId === message.id
                          ? (language === 'ar' ? "تم النسخ!" : "Copied!")
                          : (language === 'ar' ? "نسخ" : "Copy")}
                      >
                        {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => handleRegenerate(messages[index - 1]?.id)}
                        className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 shadow-sm"
                        title={language === 'ar' ? "إعادة توليد" : "Regenerate"}
                      >
                        <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
                      </button>
                      <button
                        onClick={() => handleLike(message.id)}
                        className={`p-1.5 rounded-full shadow-sm transition-all duration-300 transform hover:scale-110 ${
                          likedMessages.has(message.id)
                            ? 'bg-green-50 text-green-600'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        title={likedMessages.has(message.id)
                          ? (language === 'ar' ? "أعجبني" : "Liked")
                          : (language === 'ar' ? "إعجاب" : "Like")}
                      >
                        {likedMessages.has(message.id) ? (
                          <ThumbsUp size={14} fill="currentColor" />
                        ) : (
                          <ThumbsUp size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDislike(message.id)}
                        className={`p-1.5 rounded-full shadow-sm transition-all duration-300 transform hover:scale-110 ${
                          dislikedMessages.has(message.id)
                            ? 'bg-red-50 text-red-600'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        title={dislikedMessages.has(message.id)
                          ? (language === 'ar' ? "لم يعجبني" : "Disliked")
                          : (language === 'ar' ? "عدم إعجاب" : "Dislike")}
                      >
                        {dislikedMessages.has(message.id) ? (
                          <ThumbsDown size={14} fill="currentColor" />
                        ) : (
                          <ThumbsDown size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleSaveMessage(message)}
                        className={`p-1.5 rounded-full shadow-sm transition-all duration-300 transform hover:scale-110 ${
                          savedMessageId === message.id || isMessageSaved(message.id)
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        title={savedMessageId === message.id
                          ? (language === 'ar' ? "تم الحفظ!" : "Saved!")
                          : isMessageSaved(message.id)
                            ? (language === 'ar' ? "محفوظ" : "Saved")
                            : (language === 'ar' ? "حفظ الرسالة" : "Save message")}
                      >
                        {savedMessageId === message.id || isMessageSaved(message.id) ? (
                          <Bookmark size={14} fill="currentColor" />
                        ) : (
                          <Bookmark size={14} />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(message)}
                        className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 shadow-sm"
                        title={language === 'ar' ? "تعديل" : "Edit"}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className={`p-1.5 bg-white rounded-full shadow-sm transition-all duration-300 transform hover:scale-110 ${
                          copiedMessageId === message.id
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={copiedMessageId === message.id
                          ? (language === 'ar' ? "تم النسخ!" : "Copied!")
                          : (language === 'ar' ? "نسخ" : "Copy")}
                      >
                        {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing effect */}
        {isTyping && typingMessage && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[85%] md:max-w-[75%]">
              <div className="flex-shrink-0 mr-3 mt-1">
                <div className="bg-blue-100 rounded-full flex items-center justify-center w-8 h-8">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <TypingEffect
                  text={typingMessage}
                  onComplete={completeTyping}
                  className="text-sm text-gray-800 whitespace-pre-wrap"
                />
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                <div className="bg-blue-100 rounded-full flex items-center justify-center w-8 h-8">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex flex-col bg-gray-50 rounded-2xl border border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            {/* عرض المرفقات المحددة */}
            {attachments.length > 0 && (
              <div className="px-4 pt-3 pb-1 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 max-w-xs"
                    >
                      {file.type.startsWith('image/') ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 mr-2 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-700 truncate max-w-[120px]">{file.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Paperclip className="w-3 h-3 mr-2 text-blue-500" />
                          <span className="text-xs text-gray-700 truncate max-w-[150px]">{file.name}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                        title={language === 'ar' ? "إزالة المرفق" : "Remove attachment"}
                      >
                        <span className="text-sm">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* حقل الإدخال */}
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrowTextArea(e);
              }}
              onKeyDown={handleKeyDown}
              placeholder={language === 'ar' ? "اكتب سؤالك الطبي هنا..." : "Type your medical question..."}
              className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none resize-none min-h-[50px] max-h-[120px] text-gray-700"
              disabled={isLoading || isTyping}
              style={{ height: '50px' }}
            />

            <div className={`flex items-center px-3 py-2 ${language === 'ar' ? 'space-x-reverse' : ''} space-x-1`}>
              {/* زر المرفقات */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full transition-colors ${
                  attachments.length > 0
                    ? 'text-blue-500 hover:bg-blue-100'
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
                title={language === 'ar' ? "إرفاق ملف" : "Attach file"}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* Voice recording button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors flex items-center"
                  title={language === 'ar' ? "إيقاف التسجيل" : "Stop recording"}
                >
                  <Square className={`w-5 h-5 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-xs font-medium">{formatRecordingTime(recordingTime)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                  title={language === 'ar' ? "إدخال صوتي" : "Voice input"}
                  disabled={isLoading || isTyping}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}

              {/* زر الإرسال مع زر إيقاف الكتابة */}
              <div className="relative">
                {isTyping && (
                  <button
                    type="button"
                    onClick={stopTyping}
                    className="absolute inset-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                    title={language === 'ar' ? "إيقاف استجابة الذكاء الاصطناعي" : "Stop AI response"}
                  >
                    <Square className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isTyping || (!input.trim() && attachments.length === 0)}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={language === 'ar' ? "إرسال رسالة" : "Send message"}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500 text-center">
            <p>
              {language === 'ar'
                ? 'يقدم مساعد الذكاء الاصطناعي هذا معلومات طبية عامة فقط. استشر دائمًا أخصائي رعاية صحية للحصول على المشورة الطبية.'
                : 'This AI assistant provides general medical information only. Always consult a healthcare professional for medical advice.'
              }
            </p>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
















