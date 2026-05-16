
import React, { useState, useEffect } from 'react';
import { Trophy, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

function Leaderboard() {
  const { userProfile } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const users = await api.get('/leaderboard');
      
      const formattedUsers = users.map(u => ({
        ...u,
        uid: u.id,
        displayName: u.name,
        tasksCompleted: u.tasks_completed,
        createdAt: { toDate: () => new Date(u.created_at) }
      }));
      
      setTopUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <span>Leaderboard</span>
        </h1>
        <p className="text-gray-400 mt-2">See how you rank against other team members</p>
      </div>

      {/* User's Current Rank */}
      {userProfile && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-blue-300 mb-2">Your Current Stats</h3>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-lg text-white">{userProfile.tasksCompleted || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Tasks Completed</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 bg-white/5 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Top Performers - Tasks Completed</span>
          </h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className={`px-6 py-4 flex items-center justify-between transition-colors ${
                user.uid === userProfile?.uid ? 'bg-blue-500/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getRankIcon(index + 1)}</div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {user.displayName || 'Unknown User'}
                      {user.uid === userProfile?.uid && (
                        <span className="ml-2 text-sm text-blue-400">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      Member since {user.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-xl font-bold text-white">
                    {user.tasksCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Rank #{index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {topUsers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No rankings yet</h3>
          <p className="text-gray-400">Start completing tasks to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;