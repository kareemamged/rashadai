import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    preview?: string;
  }>;
}

interface ConsultationState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  typingMessage: string | null;
  startConsultation: (symptoms: string, age: number, gender: string) => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  completeTyping: () => void;
  stopTyping: () => void;
}

const GEMINI_API_KEY = "AIzaSyCQIn9BwZFwWoa1zDQXHAhm3LYYvQPppMc";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

const SYSTEM_PROMPT = `You are an AI medical assistant. Your role is to:
1. Only provide general medical information and guidance
2. Always recommend consulting a healthcare professional for specific medical advice
3. Never make definitive diagnoses
4. Only discuss medical topics
5. Maintain a professional and empathetic tone
6. Respect medical privacy and confidentiality
7. If asked about non-medical topics, politely redirect to medical discussions`;

// Helper function to call Gemini API directly
const callGeminiAPI = async (messages, attachments = []) => {
  try {
    // إعداد الرسائل للواجهة البرمجية
    const apiMessages = [...messages];
    
    // إضافة الصور إلى الرسالة الأخيرة إذا كانت موجودة
    if (attachments.length > 0 && apiMessages.length > 0) {
      const lastMessage = apiMessages[apiMessages.length - 1];
      
      // إضافة وصف للصور في نص الرسالة
      const imageDescriptions = attachments
        .filter(att => att.type.startsWith('image/'))
        .map(att => `[Image: ${att.name}]`)
        .join(' ');
      
      if (imageDescriptions) {
        lastMessage.parts[0].text += `\n\n${imageDescriptions}`;
      }
      
      // إضافة الصور كأجزاء منفصلة للرسالة (ملاحظة: Gemini يدعم الصور)
      attachments
        .filter(att => att.type.startsWith('image/'))
        .forEach(att => {
          // استخراج البيانات من URL البيانات
          const base64Data = att.url.split(',')[1];
          lastMessage.parts.push({
            inlineData: {
              mimeType: att.type,
              data: base64Data
            }
          });
        });
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: apiMessages
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I apologize, but I couldn't process your request. Please try again.";
  }
};

// إضافة دالة لتحميل الملفات
const uploadFile = async (file: File): Promise<string> => {
  // هنا يمكنك استبدال هذا بخدمة تخزين حقيقية مثل Supabase Storage أو Firebase Storage
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // نعيد URL البيانات كمسار مؤقت للملف
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  messages: [],
  isLoading: false,
  isTyping: false,
  typingMessage: null,

  completeTyping: () => {
    const { typingMessage } = get();
    if (typingMessage) {
      set(state => ({
        messages: [...state.messages, {
          id: Date.now().toString(),
          content: typingMessage,
          isAi: true,
          timestamp: new Date()
        }],
        isTyping: false,
        typingMessage: null
      }));
    }
  },
  
  stopTyping: () => {
    const { typingMessage } = get();
    if (typingMessage) {
      // إضافة الرسالة الحالية كما هي (غير مكتملة)
      const currentDisplayedText = document.querySelector('.typing-effect-text')?.textContent || '';
      
      if (currentDisplayedText) {
        set(state => ({
          messages: [...state.messages, {
            id: Date.now().toString(),
            content: currentDisplayedText,
            isAi: true,
            timestamp: new Date()
          }],
          isTyping: false,
          typingMessage: null
        }));
      } else {
        // إذا لم نتمكن من الحصول على النص المعروض، استخدم النص الكامل
        set(state => ({
          messages: [...state.messages, {
            id: Date.now().toString(),
            content: typingMessage + " [response interrupted]",
            isAi: true,
            timestamp: new Date()
          }],
          isTyping: false,
          typingMessage: null
        }));
      }
    }
  },

  startConsultation: async (symptoms: string, age: number, gender: string) => {
    const initialMessage = `I am a ${age} year old ${gender} experiencing the following symptoms: ${symptoms}`;
    
    set({ 
      messages: [
        {
          id: Date.now().toString(),
          content: initialMessage,
          isAi: false,
          timestamp: new Date()
        }
      ], 
      isLoading: true,
      isTyping: false,
      typingMessage: null
    });

    try {
      // Prepare messages for API
      const apiMessages = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "I understand my role as a medical assistant. I'll follow these guidelines in our conversation." }] },
        { role: "user", parts: [{ text: initialMessage }] }
      ];

      // Call Gemini API
      const aiResponse = await callGeminiAPI(apiMessages);
      
      // Set typing effect instead of adding message directly
      set({ 
        isLoading: false,
        isTyping: true,
        typingMessage: aiResponse
      });
      
    } catch (error) {
      console.error('Error starting consultation:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  sendMessage: async (content: string, attachments: File[] = []) => {
    const { messages } = get();
    
    // معالجة المرفقات إذا وجدت
    let messageAttachments = [];
    if (attachments.length > 0) {
      // تحميل جميع الملفات وإنشاء معلومات المرفقات
      messageAttachments = await Promise.all(
        attachments.map(async (file) => {
          const url = await uploadFile(file);
          return {
            id: Date.now() + Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type,
            url: url,
            preview: file.type.startsWith('image/') ? url : undefined
          };
        })
      );
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isAi: false,
      timestamp: new Date(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    };

    set({ 
      messages: [...messages, newMessage], 
      isLoading: true,
      isTyping: false,
      typingMessage: null
    });

    try {
      // Prepare messages for API
      const apiMessages = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "I understand my role as a medical assistant. I'll follow these guidelines in our conversation." }] },
      ];
      
      // Add existing conversation
      messages.forEach(msg => {
        if (msg.isAi) {
          apiMessages.push({ role: "model", parts: [{ text: msg.content }] });
        } else {
          const parts = [{ text: msg.content }];
          apiMessages.push({ role: "user", parts });
        }
      });
      
      // Add the new message
      apiMessages.push({ role: "user", parts: [{ text: content }] });
      
      // Call Gemini API with attachments
      const aiResponse = await callGeminiAPI(apiMessages, messageAttachments);

      // Set typing effect instead of adding message directly
      set({ 
        isLoading: false,
        isTyping: true,
        typingMessage: aiResponse
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));





















