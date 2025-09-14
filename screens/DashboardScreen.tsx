

import React, { useState, useEffect, useMemo } from 'react';
// FIX: The import for `Link` is correct for react-router-dom v5. The error was likely a cascading issue from other files using v6 syntax.
import { Link } from 'react-router-dom';
import { useListener } from './../context/ListenerContext';
import { db } from './../utils/firebase';
import firebase from 'firebase/compat/app';
// Fix: Use ListenerAppStatus instead of the non-existent ListenerStatus.
import type { CallRecord, ListenerChatSession, ListenerAppStatus } from '../types';
import InstallPWAButton from '../components/common/InstallPWAButton';

// Type definitions for combined activity feed
// Fix: Use Omit to prevent type conflict on 'type' property from CallRecord.
type CallActivity = Omit<CallRecord, 'type'> & { type: 'call'; timestamp: firebase.firestore.Timestamp; };
type ChatActivity = ListenerChatSession & { type: 'chat'; timestamp: firebase.firestore.Timestamp; };
type Activity = CallActivity | ChatActivity;

// --- Icon Components ---
const RupeeIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 4h4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PhoneIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
const ChatIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const ClockIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- UI Sub-Components ---

const StatValue: React.FC<{ loading: boolean; children: React.ReactNode }> = ({ loading, children }) => {
    if (loading) {
        return <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>;
    }
    return <>{children}</>;
};

const formatDuration = (seconds: number = 0): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    result += `${minutes}m`;
    return result;
};

type StatCardColor = 'blue' | 'indigo' | 'purple' | 'green';
const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ReactNode; color: StatCardColor; linkTo?: string; }> = ({ title, value, icon, color, linkTo }) => {
    const colorClasses = {
        blue: 'from-cyan-50 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30 border-sky-200 dark:border-sky-800',
        indigo: 'from-indigo-50 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 border-violet-200 dark:border-violet-800',
        purple: 'from-purple-50 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/30 border-fuchsia-200 dark:border-fuchsia-800',
        green: 'from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    };
    
    const content = (
         <div className={`bg-gradient-to-br p-3 rounded-xl shadow-sm flex flex-col justify-between h-full border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${colorClasses[color]}`}>
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    {icon}
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{value}</div>
            </div>
        </div>
    );
    
    return linkTo ? <Link to={linkTo} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl">{content}</Link> : content;
};

// Fix: Refactor ActivityRow to safely access properties based on activity type.
const ActivityRow: React.FC<{ activity: Activity }> = ({ activity }) => {
    const isCall = activity.type === 'call';

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCall ? 'bg-cyan-100 dark:bg-cyan-900/50' : 'bg-purple-100 dark:bg-purple-900/50'}`}>
                    {isCall ? <PhoneIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-300"/> : <ChatIcon className="h-5 w-5 text-purple-600 dark:text-purple-300"/>}
                </div>
                <div className="overflow-hidden">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {isCall ? 'Call with' : 'Chat with'} {activity.userName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {isCall ? `Duration: ${formatDuration(activity.durationSeconds)}` : activity.lastMessageText}
                    </p>
                </div>
            </div>
            {isCall && activity.earnings != null && activity.earnings > 0 && (
                <p className="font-bold text-green-600 dark:text-green-400 text-sm shrink-0 ml-2">
                    + ₹{activity.earnings.toFixed(2)}
                </p>
            )}
        </div>
    );
};


const DisabledStatusToggle: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 opacity-60">
        <div className="flex-grow text-center sm:text-left">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Active Status</h3>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{message}</p>
        </div>
        <div className="inline-flex items-stretch rounded-full border border-slate-300 dark:border-slate-600 p-1 flex-shrink-0 cursor-not-allowed">
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-400 dark:text-slate-500">Offline</span>
            <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-400 dark:text-slate-500">Busy</span>
            <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-400 dark:text-slate-500">Online</span>
        </div>
    </div>
);

const StatusToggle: React.FC = () => {
    const { profile, loading: profileLoading } = useListener();
    // Fix: Use ListenerAppStatus type.
    const [optimisticStatus, setOptimisticStatus] = useState<ListenerAppStatus | null>(null);

    // Sync local state with profile from context
    useEffect(() => {
        // Fix: Use profile.appStatus instead of profile.status.
        if (profile?.appStatus) {
            setOptimisticStatus(profile.appStatus);
        } else if (!profileLoading && !profile) {
            setOptimisticStatus(null);
        }
    }, [profile, profileLoading]);
    
    // Fix: Use ListenerAppStatus type.
    const handleStatusChange = async (newStatus: ListenerAppStatus) => {
        if (!profile) return;

        // Fix: Use profile.appStatus instead of profile.status.
        const previousStatus = optimisticStatus || profile.appStatus;
        setOptimisticStatus(newStatus); // Optimistically update the UI

        try {
            // Fix: Update appStatus field instead of status.
            await db.collection('listeners').doc(profile.uid).update({ appStatus: newStatus });
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on error
            setOptimisticStatus(previousStatus);
            alert("Failed to update status. Please check your connection and try again.");
        }
    };
    
    if (profileLoading) {
        return <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>;
    }

    if (!profile) {
        return <DisabledStatusToggle message="Listener profile could not be found." />;
    }
    
    if (!optimisticStatus) {
        return <DisabledStatusToggle message="Status could not be loaded from profile." />;
    }

    const getSubtitle = () => {
        switch (optimisticStatus) {
            case 'Available':
                return 'You are ready to take calls';
            case 'Busy':
            case 'Break':
                return 'You will not receive new calls';
            case 'Offline':
            default:
                return 'Go online to start taking calls';
        }
    };
    
    const currentUiStatus = optimisticStatus === 'Break' ? 'Busy' : optimisticStatus;
    
    const statuses: { label: string; value: ListenerAppStatus }[] = [
        { label: 'Offline', value: 'Offline' },
        { label: 'Busy', value: 'Busy' },
        { label: 'Online', value: 'Available' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start">
                    Active Status
                    <span className="ml-1.5 text-slate-400 cursor-help" title="Set your status to control incoming calls.">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                    </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{getSubtitle()}</p>
            </div>
            
            <div className="inline-flex items-stretch rounded-full border border-slate-300 dark:border-slate-600 p-1 flex-shrink-0">
                {statuses.map((status, index) => (
                    <React.Fragment key={status.value}>
                        <button
                            onClick={() => handleStatusChange(status.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:ring-offset-slate-800 focus-visible:ring-cyan-500 ${
                                currentUiStatus === status.value
                                    ? (status.value === 'Available' ? 'bg-green-500 text-white shadow-md' : 'text-slate-800 dark:text-slate-100')
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            {status.label}
                        </button>
                        {index < statuses.length - 1 && (
                            <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


// --- Main Dashboard Screen Component ---
const DashboardScreen: React.FC = () => {
    const { profile, loading: profileLoading } = useListener();
    const [calls, setCalls] = useState<CallActivity[]>([]);
    const [chats, setChats] = useState<ChatActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [earningsData, setEarningsData] = useState<{ today: number, week: number }>({ today: 0, week: 0 });
    const [loadingEarnings, setLoadingEarnings] = useState(true);

    useEffect(() => {
        if (!profile?.uid) {
            if (!profileLoading) setLoadingEarnings(false);
            return;
        }
        setLoadingEarnings(true);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const earningsQuery = db.collection('listeners').doc(profile.uid).collection('earnings')
            .where('timestamp', '>=', sevenDaysAgoTimestamp);

        const unsubEarnings = earningsQuery.onSnapshot(snapshot => {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start of week

            let todayEarnings = 0;
            let weekEarnings = 0;

            snapshot.docs.forEach(doc => {
                const record = doc.data();
                const amount = record.amount || 0;
                const timestamp = record.timestamp.toDate();

                if (timestamp >= startOfWeek) {
                    weekEarnings += amount;
                }
                if (timestamp >= startOfToday) {
                    todayEarnings += amount;
                }
            });
            
            setEarningsData({ today: todayEarnings, week: weekEarnings });
            setLoadingEarnings(false);
        }, () => setLoadingEarnings(false));

        return () => unsubEarnings();
    }, [profile?.uid, profileLoading]);

    // Optimization: Fetch calls and chats into separate states to prevent race conditions and unnecessary re-renders.
    useEffect(() => {
        if (!profile?.uid) {
            if (!profileLoading) setLoadingActivities(false);
            return;
        }
        setLoadingActivities(true);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const callsQuery = db.collection('calls').where('listenerId', '==', profile.uid).where('startTime', '>=', sevenDaysAgoTimestamp);
        const unsubCalls = callsQuery.onSnapshot(snapshot => {
            const callsData = snapshot.docs.map(doc => ({ ...doc.data(), callId: doc.id, type: 'call', timestamp: doc.data().startTime } as CallActivity));
            setCalls(callsData);
            setLoadingActivities(false);
        }, () => setLoadingActivities(false));
        
        const chatsQuery = db.collection('chats').where('listenerId', '==', profile.uid).where('lastMessageTimestamp', '>=', sevenDaysAgoTimestamp);
        const unsubChats = chatsQuery.onSnapshot(snapshot => {
            const chatsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'chat', timestamp: doc.data().lastMessageTimestamp } as ChatActivity));
            setChats(chatsData);
            setLoadingActivities(false);
        }, () => setLoadingActivities(false));

        return () => { unsubCalls(); unsubChats(); };
    }, [profile?.uid, profileLoading]);

    const allActivities = useMemo(() => {
        return [...calls, ...chats].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
    }, [calls, chats]);

    const { todayStats, weekStats, recentActivities } = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start of week

        const todayActivities = allActivities.filter(a => a.timestamp.toDate() >= startOfToday);
        const weekActivities = allActivities.filter(a => a.timestamp.toDate() >= startOfWeek);
        
        const todayCalls = todayActivities.filter((a): a is CallActivity => a.type === 'call');
        const weekCalls = weekActivities.filter((a): a is CallActivity => a.type === 'call');
        const todayChatsCount = todayActivities.filter(a => a.type === 'chat').length;

        return {
            todayStats: {
                calls: todayCalls.length,
                duration: todayCalls.reduce((sum, call) => sum + (call.durationSeconds || 0), 0),
                chats: todayChatsCount,
            },
            weekStats: {
                calls: weekCalls.length,
                chats: weekActivities.filter(a => a.type === 'chat').length,
                avgDuration: weekCalls.length > 0 ? (weekCalls.reduce((sum, call) => sum + (call.durationSeconds || 0), 0) / weekCalls.length) : 0,
            },
            recentActivities: allActivities.slice(0, 5)
        };
    }, [allActivities]);

    return (
        <div className="p-4 space-y-6">
            <InstallPWAButton />
            <StatusToggle />
            
            <hr className="my-6 border-slate-200 dark:border-slate-700" />
            
            {/* Today's Summary */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Today's Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard title="Today's Calls" color="blue" linkTo="/calls" icon={<PhoneIcon className="h-5 w-5 text-cyan-500"/>} value={<StatValue loading={loadingActivities}>{todayStats.calls}</StatValue>} />
                    <StatCard title="Total Talk Time" color="indigo" icon={<ClockIcon className="h-5 w-5 text-indigo-500"/>} value={<StatValue loading={loadingActivities}>{formatDuration(todayStats.duration)}</StatValue>} />
                    <StatCard title="Today's Chats" color="purple" linkTo="/chat" icon={<ChatIcon className="h-5 w-5 text-purple-500"/>} value={<StatValue loading={loadingActivities}>{todayStats.chats}</StatValue>} />
                    <StatCard title="Today's Earnings" color="green" linkTo="/earnings" icon={<RupeeIcon className="h-5 w-5 text-green-500"/>} value={<StatValue loading={loadingEarnings}>₹{earningsData.today.toFixed(2)}</StatValue>} />
                </div>
            </div>

            <hr className="my-6 border-slate-200 dark:border-slate-700" />

            {/* This Week's Performance */}
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">This Week's Performance</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard title="Total Calls" color="blue" linkTo="/calls" icon={<PhoneIcon className="h-5 w-5 text-cyan-500"/>} value={<StatValue loading={loadingActivities}>{weekStats.calls}</StatValue>} />
                    <StatCard title="Weekly Earnings" color="green" linkTo="/earnings" icon={<RupeeIcon className="h-5 w-5 text-green-500"/>} value={<StatValue loading={loadingEarnings}>₹{earningsData.week.toFixed(2)}</StatValue>} />
                    <StatCard title="Total Chats" color="purple" linkTo="/chat" icon={<ChatIcon className="h-5 w-5 text-purple-500"/>} value={<StatValue loading={loadingActivities}>{weekStats.chats}</StatValue>} />
                    <StatCard title="Avg. Call Duration" color="indigo" icon={<ClockIcon className="h-5 w-5 text-indigo-500"/>} value={<StatValue loading={loadingActivities}>{formatDuration(weekStats.avgDuration)}</StatValue>} />
                </div>
            </div>

            <hr className="my-6 border-slate-200 dark:border-slate-700" />

            {/* Recent Activity */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Recent Activity</h3>
                <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700/90 p-4 rounded-xl shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
                    {loadingActivities ? (
                         <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading activity...</div>
                    ) : recentActivities.length > 0 ? (
                        recentActivities.map(activity => <ActivityRow key={`${activity.type}-${activity.type === 'call' ? (activity as CallActivity).callId : (activity as ChatActivity).id}`} activity={activity} />)
                    ) : (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">No recent activity.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;