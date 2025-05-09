import React, { useState } from 'react';
import { Copy, Check, Trash2, Search, X, Bot } from 'lucide-react';
import { useSavedMessagesStore } from '../../store/savedMessagesStore';
import ChatHeader from '../../components/ChatHeader';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';

const SavedMessages: React.FC = () => {
  const { savedMessages, removeMessage } = useSavedMessagesStore();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const isRtl = language === 'ar';

  // Filter messages based on search term
  const filteredMessages = searchTerm
    ? savedMessages.filter(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : savedMessages;

  // Sort messages by timestamp (newest first)
  const sortedMessages = [...filteredMessages].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <ChatHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isRtl ? 'الرسائل المحفوظة' : 'Saved Messages'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isRtl 
                ? 'مجموعة من الرسائل المهمة التي قمت بحفظها من المحادثات السابقة' 
                : 'A collection of important messages you have saved from previous conversations'}
            </p>
          </div>
          
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder={isRtl ? "البحث في الرسائل المحفوظة..." : "Search saved messages..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Messages list */}
          <div className="divide-y divide-gray-200">
            {sortedMessages.length > 0 ? (
              sortedMessages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="bg-blue-100 rounded-full flex items-center justify-center w-8 h-8">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <p className="text-gray-800 whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(message.timestamp)}
                          {message.source && (
                            <span className="ml-2 text-gray-400">
                              {isRtl ? 'المصدر: ' : 'Source: '}{message.source}
                            </span>
                          )}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className={`p-1.5 rounded-full transition-all duration-300 ${
                              copiedMessageId === message.id
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                            title={copiedMessageId === message.id
                              ? (isRtl ? "تم النسخ!" : "Copied!")
                              : (isRtl ? "نسخ" : "Copy")}
                          >
                            {copiedMessageId === message.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <button
                            onClick={() => removeMessage(message.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-all duration-300"
                            title={isRtl ? "حذف" : "Delete"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  {isRtl ? 'لا توجد رسائل محفوظة' : 'No saved messages'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {isRtl 
                    ? 'عندما تحفظ رسائل من المحادثات مع المساعد الطبي، ستظهر هنا للرجوع إليها لاحقًا.' 
                    : 'When you save messages from conversations with the medical assistant, they will appear here for later reference.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedMessages;
