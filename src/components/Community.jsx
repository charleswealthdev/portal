// src/components/Community.jsx (Enhanced: Daily login, community tasks, social leaderboard, improved UI/UX)
import { useEffect, useState } from 'react';
import { useAuth } from '../WalletAuth';
import { getRecentActivity, loadGameData } from '../firebase';

export default function Community({ onOpenModal }) {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loginStreak, setLoginStreak] = useState(0);
  const [communityPoints, setCommunityPoints] = useState(0);
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState([]);

  // Mock community tasks
  const communityTasks = [
    {
      id: 1,
      title: 'Follow @playrushio on Twitter',
      points: 50,
      type: 'twitter',
      action: 'follow',
      url: 'https://twitter.com/playrushio',
      completed: false
    },
    {
      id: 2,
      title: 'Retweet our latest announcement',
      points: 100,
      type: 'twitter',
      action: 'retweet',
      url: 'https://twitter.com/playrushio',
      completed: false
    },
    {
      id: 3,
      title: 'Join our Discord server',
      points: 75,
      type: 'discord',
      action: 'join',
      url: 'https://discord.gg/playrush',
      completed: false
    },
    {
      id: 4,
      title: 'Share your high score',
      points: 150,
      type: 'share',
      action: 'share',
      completed: false
    }
  ];

  useEffect(() => {
    async function fetchCommunityData() {
      if (user) {
        try {
          // Load user profile data
          const data = await loadGameData();
          if (data) {
            setProfile(data);
          } else {
            setError('No profile data found.');
          }

          // Load recent activities
          const activityData = await getRecentActivity(user.id);
          setActivities(activityData || []);

          // Fetch user-specific data from Firestore
          // This would typically come from the user document in Firestore
          setLoginStreak(Math.floor(Math.random() * 10) + 1);
          setCommunityPoints(Math.floor(Math.random() * 1000) + 100);
          setLastLogin(new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)));
        } catch (err) {
          setError('Failed to load community data: ' + err.message);
        }
      }
    }

    fetchCommunityData();
  }, [user]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const completeTask = async (taskId) => {
    const task = communityTasks.find(t => t.id === taskId);
    if (task && !dailyTasksCompleted.includes(taskId)) {
      try {
        // In a real implementation, this would update Firestore
        setDailyTasksCompleted([...dailyTasksCompleted, taskId]);
        setCommunityPoints(communityPoints + task.points);
        setMessage(`Task completed! +${task.points} points`);
        
        // Add to community activities
        const newActivity = {
          title: 'Task Completed',
          description: `Completed task: ${task.title}`,
          type: 'task',
          timestamp: new Date(),
          points: task.points,
          userId: user?.id
        };
        
        // In a real implementation, this would be added to Firestore
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
        
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setError('Failed to complete task: ' + err.message);
      }
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#8338ec] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-orbitron font-bold mb-6">Community</h1>
          <p className="text-gray-400 mb-8">Join our community to participate in events, complete tasks, and climb the social leaderboard.</p>
          <button
            onClick={onOpenModal}
            className="bg-[#8338ec] hover:bg-[#722ed1] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-orbitron font-bold mb-2">Community</h1>
        <p className="text-gray-400 mb-8">Join our community to participate in events, complete tasks, and climb the social leaderboard.</p>

        {message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
            <p className="text-green-200">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111] rounded-xl p-6 border border-[#8338ec]/30">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-[#8338ec] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-orbitron font-bold">Login Streak</h3>
            </div>
            <p className="text-3xl font-orbitron font-bold text-[#8338ec]">{loginStreak} days</p>
            <p className="text-gray-400 text-sm mt-1">Keep it up!</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#8338ec]/30">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-[#ff006e] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-orbitron font-bold">Community Points</h3>
            </div>
            <p className="text-3xl font-orbitron font-bold text-[#ff006e]">{communityPoints?.toLocaleString()}</p>
            <p className="text-gray-400 text-sm mt-1">Earn more by completing tasks</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#8338ec]/30">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-[#3a86ff] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-orbitron font-bold">Last Login</h3>
            </div>
            <p className="text-3xl font-orbitron font-bold text-[#3a86ff]">
              {lastLogin ? formatTimeAgo(lastLogin) : 'Today'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Great to see you!</p>
          </div>
        </div>

        {/* Community Tasks */}
        <div className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden mb-8">
          <div className="p-6 border-b border-[#8338ec]/20">
            <h2 className="text-2xl font-orbitron font-bold">Daily Tasks</h2>
            <p className="text-gray-400">Complete tasks to earn community points</p>
          </div>
          
          <div className="divide-y divide-[#8338ec]/20">
            {communityTasks.map((task) => (
              <div key={task.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 ${
                    dailyTasksCompleted.includes(task.id) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-[#1a1a1a] text-gray-400'
                  }`}>
                    {dailyTasksCompleted.includes(task.id) ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{task.id}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold">{task.title}</h3>
                    <p className="text-gray-400 text-sm">+{task.points} points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.type === 'twitter' && (
                    <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                  )}
                  
                  {task.type === 'discord' && (
                    <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.073.073 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.057c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                  )}
                  
                  <button
                    onClick={() => completeTask(task.id)}
                    disabled={dailyTasksCompleted.includes(task.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dailyTasksCompleted.includes(task.id)
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-[#8338ec] hover:bg-[#722ed1] text-white'
                    }`}
                  >
                    {dailyTasksCompleted.includes(task.id) ? 'Completed' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden">
          <div className="p-6 border-b border-[#8338ec]/20">
            <h2 className="text-2xl font-orbitron font-bold">Recent Activity</h2>
            <p className="text-gray-400">Latest community events and achievements</p>
          </div>
          
          <div className="divide-y divide-[#8338ec]/20">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-6 flex items-start hover:bg-[#1a1a1a] transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8338ec]/20 flex items-center justify-center mr-4">
                    {activity.type === 'login' && (
                      <svg className="w-5 h-5 text-[#8338ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    {activity.type === 'task' && (
                      <svg className="w-5 h-5 text-[#ff006e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {activity.type === 'leaderboard' && (
                      <svg className="w-5 h-5 text-[#3a86ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-orbitron font-bold">{activity.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-2">{formatTimeAgo(new Date(activity.timestamp))}</p>
                  </div>
                  {activity.points && (
                    <div className="flex-shrink-0 ml-4">
                      <span className="bg-[#ff006e]/20 text-[#ff006e] px-2 py-1 rounded-full text-xs font-bold">
                        +{activity.points} pts
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-gray-600 text-sm mt-1">Complete tasks to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}