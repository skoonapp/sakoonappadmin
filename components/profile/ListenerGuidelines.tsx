import React from 'react';

// --- Icons ---
const SectionIcon: React.FC<{ children: React.ReactNode, colorClass: string }> = ({ children, colorClass }) => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
        {children}
    </div>
);
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.168-.217c-.737 0-1.33.66-1.33 1.475 0 .815.593 1.475 1.33 1.475.737 0 1.33-.66 1.33-1.475v-.825a3.5 3.5 0 00-1.33-2.667z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.831.876 1.5 1.5 0 101.5 2.596V10.5a1.5 1.5 0 103 0v-1.032a4.5 4.5 0 00-1.169-3.168V5z" clipRule="evenodd" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.852-1.21 3.488 0l6.195 11.834c.636 1.21-.472 2.686-1.744 2.686H3.806c-1.272 0-2.38-1.476-1.744-2.686l6.195-11.834zM9 13a1 1 0 112 0v1a1 1 0 11-2 0v-1zm1-4a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const GuidelineSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; colorClass: string }> = ({ title, children, icon, colorClass }) => (
    <div className="flex items-start gap-4 p-4">
        <SectionIcon colorClass={colorClass}>{icon}</SectionIcon>
        <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">{children}</div>
        </div>
    </div>
);

export const GuidelinesContent: React.FC = () => {
    return (
        <div className="divide-y divide-slate-200 dark:divide-slate-700 -m-4 md:-m-6">
            <GuidelineSection title="User Interaction Rules" icon={<UserIcon />} colorClass="bg-blue-500">
                <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>कॉल या चैट को बीच में disconnect मत करें।</li>
                    <li>User के साथ misbehave नहीं करें।</li>
                    <li className="text-red-600 dark:text-red-400 font-semibold">Abusing, sexual content या offensive language पूरी तरह मना है।</li>
                    <li className="text-red-600 dark:text-red-400 font-semibold">Personal details share करने से आपकी ID suspend या disable हो सकती है।</li>
                    <li className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md font-medium text-yellow-800 dark:text-yellow-300">Admin आपकी activity monitor कर रहे हैं।</li>
                </ul>
            </GuidelineSection>

            <GuidelineSection title="Performance & Engagement" icon={<ChartIcon />} colorClass="bg-green-500">
                 <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>आपकी earning performance-based होगी।</li>
                    <li>Engagement जितना ज़्यादा, earning उतनी ज़्यादा।</li>
                    <li>Engagement कम → income decrease।</li>
                    <li className="font-semibold text-green-700 dark:text-green-300">High-quality engagement → extra incentives मिल सकते हैं।</li>
                </ul>
            </GuidelineSection>

            <GuidelineSection title="कमाई कैसे होगी? (How You Earn)" icon={<MoneyIcon />} colorClass="bg-yellow-500">
                <p>आपकी कमाई दो तरीकों से होती है: वॉयस कॉल और चैट मैसेज।</p>
                
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mt-3">A) वॉयस कॉल के लिए (ब्रैकेट सिस्टम):</h4>
                <p>आपको प्रति मिनट का रेट कॉल की कुल लंबाई (duration) के हिसाब से मिलता है। कॉल जितनी लंबी होगी, प्रति मिनट का रेट उतना ही ज़्यादा होगा।</p>
                <ul className="list-disc list-outside pl-5 mt-2 space-y-1">
                    <li><strong>5 मिनट तक की कॉल पर:</strong> ₹2.0 प्रति मिनट</li>
                    <li><strong>6 से 15 मिनट की कॉल पर:</strong> ₹2.5 प्रति मिनट</li>
                    <li><strong>16 से 30 मिनट की कॉल पर:</strong> ₹3.0 प्रति मिनट</li>
                    <li><strong>31 से 45 मिनट की कॉल पर:</strong> ₹3.5 प्रति मिनट</li>
                    <li><strong>45 मिनट से ज़्यादा की कॉल पर:</strong> ₹3.6 प्रति मिनट</li>
                </ul>
                <p className="mt-2 text-xs italic bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md"><strong>उदाहरण:</strong> अगर आप 20 मिनट की कॉल पूरी करते हैं, तो आपकी कमाई होगी: 20 मिनट x ₹3.0/मिनट = ₹60</p>

                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mt-4">B) चैट मैसेज के लिए (फिक्स्ड रेट):</h4>
                <p>आपको हर भेजे गए मैसेज के लिए एक फिक्स्ड रेट मिलता है।</p>
                <ul className="list-disc list-outside pl-5 mt-2 space-y-1">
                    <li><strong>हर मैसेज पर कमाई:</strong> ₹0.50 प्रति मैसेज</li>
                </ul>
                 <p className="mt-2 text-xs italic bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md"><strong>उदाहरण:</strong> अगर आप 25 मैसेज का जवाब देते हैं, तो आपकी कमाई होगी: 25 मैसेज x ₹0.50/मैसेज = ₹12.50</p>
            </GuidelineSection>

            <GuidelineSection title="Safety & Privacy" icon={<ShieldIcon />} colorClass="bg-indigo-500">
                 <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>User और listener की privacy हमेशा safe रहेगी।</li>
                    <li>Personal contact, address या sensitive info share न करें।</li>
                    <li>Suspicious activity → report immediately।</li>
                </ul>
            </GuidelineSection>

            <GuidelineSection title="Professional Conduct" icon={<BriefcaseIcon />} colorClass="bg-purple-500">
                <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>हमेशा friendly, polite और respectful रहें।</li>
                    <li>User satisfaction पर ध्यान दें → long calls/chats → higher earnings।</li>
                    <li>Admin feedback follow करें।</li>
                </ul>
            </GuidelineSection>
            
            <GuidelineSection title="Consequences of Violation" icon={<WarningIcon />} colorClass="bg-red-500">
                <ul className="list-disc list-outside pl-5 space-y-1 font-semibold text-red-600 dark:text-red-400">
                    <li>Rules violate → earning suspend या reduce हो सकती है।</li>
                    <li>Serious violation → ID permanently disable हो सकता है।</li>
                </ul>
            </GuidelineSection>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <blockquote className="text-center italic font-semibold text-slate-700 dark:text-slate-300">
                    “Respect users, maintain engagement, follow rules, grow your income safely.”
                </blockquote>
            </div>
        </div>
    );
};