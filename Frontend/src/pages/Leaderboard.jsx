
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <span>Leaderboard</span>
        </h1>
        <p className="text-gray-600 mt-2">See how you rank against other team members</p>
      </div>

      {/* User's Current Rank */}
      {userProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Current Stats</h3>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-lg">{userProfile.tasksCompleted || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Top Performers - Tasks Completed</span>
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className={`px-6 py-4 flex items-center justify-between ${
                user.uid === userProfile?.uid ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getRankIcon(index + 1)}</div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.displayName || 'Unknown User'}
                      {user.uid === userProfile?.uid && (
                        <span className="ml-2 text-sm text-blue-600">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Member since {user.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {user.tasksCompleted || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Rank #{index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {topUsers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
          <p className="text-gray-600">Start completing tasks to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;