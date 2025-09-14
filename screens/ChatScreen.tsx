import React, { useState, useEffect, useRef } from 'react';
import { useListener } from '../context/ListenerContext';
import { db, storage } from '../utils/firebase';
import type { ListenerChatSession, ChatMessage } from '../types';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import firebase from 'firebase/compat/app';

const ChatScreen: React.FC = () => {
    const { profile } = useListener();
    const [sessions, setSessions] = useState<ListenerChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ListenerChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat sessions
    useEffect(() => {
        if (!profile?.uid) return;
        setLoading(true);
        const unsubscribe = db.collection('chats')
            .where('listenerId', '==', profile.uid)
            .orderBy('lastMessageTimestamp', 'desc')
            .onSnapshot(snapshot => {
                const sessionData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ListenerChatSession));
                setSessions(sessionData);
                setLoading(false);
            }, error => {
                console.error("Error fetching chat sessions:", error);
                setLoading(false);
            });
        return () => unsubscribe();
    }, [profile?.uid]);

    // Fetch messages for active session
    useEffect(() => {
        if (!activeSession) {
            setMessages([]);
            return;
        }
        // Optimization: Fetch only the last 50 messages to improve performance on long chats.
        const unsubscribe = db.collection('chats').doc(activeSession.id).collection('messages')
            .orderBy('timestamp', 'desc') // Order by desc to get the last N messages
            .limit(50)
            .onSnapshot(snapshot => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ChatMessage))
                .reverse(); // Reverse the array on the client to display in correct order
                setMessages(messagesData);
            });
        return () => unsubscribe();
    }, [activeSession]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendText = async (text: string) => {
        if (!profile || !activeSession) return;
        const message: Omit<ChatMessage, 'id'> = {
            senderId: profile.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
            status: 'sent',
            type: 'text',
        };
        await db.collection('chats').doc(activeSession.id).collection('messages').add(message);
    };
    
    const handleSendAudio = async (audioBlob: Blob, duration: number) => {
        if (!profile || !activeSession) return;
        const filePath = `chats/${activeSession.id}/${new Date().getTime()}.webm`;
        const fileRef = storage.ref(filePath);
        await fileRef.put(audioBlob);
        const audioUrl = await fileRef.getDownloadURL();
        
        const message: Omit<ChatMessage, 'id'> = {
            senderId: profile.uid,
            text: 'Voice message',
            timestamp: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
            status: 'sent',
            type: 'audio',
            audioUrl: audioUrl,
            duration: Math.round(duration),
        };
        await db.collection('chats').doc(activeSession.id).collection('messages').add(message);
    };

    return (
        <div className="flex h-full">
            {/* Sessions List */}
            <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col ${activeSession ? 'hidden md:flex' : 'flex'}`}>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Chats</h1>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {loading ? <p className="p-4">Loading chats...</p> : sessions.map(session => (
                        <div key={session.id} onClick={() => setActiveSession(session)} className={`p-4 cursor-pointer flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 ${activeSession?.id === session.id ? 'bg-cyan-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {/* Avatar placeholder */}
                            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                            <div className="flex-grow overflow-hidden">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{session.userName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{session.lastMessageText}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message View */}
            <div className={`w-full md:w-2/3 flex flex-col ${activeSession ? 'flex' : 'hidden md:flex'}`}>
                {activeSession ? (
                    <>
                        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <button onClick={() => setActiveSession(null)} className="md:hidden p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                            <h2 className="font-bold text-slate-800 dark:text-slate-200">{activeSession.userName}</h2>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto">
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === profile?.uid} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <ChatInput onSendText={handleSendText} onSendAudio={handleSendAudio} recentMessages={messages.slice(-5)} />
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatScreen;