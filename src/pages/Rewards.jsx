import React, { useState, useEffect } from 'react';
import { Gift, Coins, Star, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const availableRewards = [
  {
    id: 'coffee',
    name: 'Coffee Voucher',
    description: 'Free coffee from the office cafeteria',
    cost: 50,
    icon: '☕',
    category: 'Food & Drink'
  },
  {
    id: 'lunch',
    name: 'Team Lunch',
    description: 'Team lunch at a nice restaurant',
    cost: 200,
    icon: '🍽️',
    category: 'Food & Drink'
  },
  {
    id: 'flexible-hours',
    name: 'Flexible Hours (1 Day)',
    description: 'Work flexible hours for one day',
    cost: 100,
    icon: '⏰',
    category: 'Time Off'
  },
  {
    id: 'half-day-off',
    name: 'Half Day Off',
    description: 'Take half a day off',
    cost: 300,
    icon: '🏖️',
    category: 'Time Off'
  },
  {
    id: 'training',
    name: 'Online Training Course',
    description: 'Access to premium online training course',
    cost: 500,
    icon: '📚',
    category: 'Learning'
  },
  {
    id: 'parking',
    name: 'Premium Parking Spot',
    description: 'Reserved parking spot for one week',
    cost: 150,
    icon: '🚗',
    category: 'Perks'
  },
  {
    id: 'tech-gadget',
    name: 'Tech Gadget',
    description: 'Choose from a selection of tech accessories',
    cost: 800,
    icon: '🎧',
    category: 'Tech'
  },
  {
    id: 'team-outing',
    name: 'Team Outing',
    description: 'Organize a fun team outing activity',
    cost: 1000,
    icon: '🎉',
    category: 'Team Building'
  }
];

function Rewards() {
  const { user, userProfile, updateUserRewards } = useAuth();
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchClaimedRewards();
  }, [user]);

  const fetchClaimedRewards = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'claimedRewards'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const claimed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClaimedRewards(claimed);
    } catch (error) {
      console.error('Error fetching claimed rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!user || !userProfile) return;
    
    if (userProfile.rewardPoints < reward.cost) {
      toast.error('Insufficient reward points!');
      return;
    }

    try {
      // Add to claimed rewards
      await addDoc(collection(db, 'claimedRewards'), {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        claimedAt: Timestamp.now(),
        status: 'pending'
      });

      // Deduct points from user
      await updateUserRewards(-reward.cost);
      
      // Update local state
      setClaimedRewards(prev => [...prev, {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        claimedAt: Timestamp.now(),
        status: 'pending'
      }]);

      toast.success(`${reward.name} claimed successfully! Check with HR for fulfillment.`);
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const categories = ['all', ...new Set(availableRewards.map(r => r.category))];

  const filteredRewards = selectedCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(r => r.category === selectedCategory);

  const isRewardClaimed = (rewardId) => {
    return claimedRewards.some(claimed => claimed.rewardId === rewardId);
  };

  const canAfford = (cost) => {
    return userProfile && userProfile.rewardPoints >= cost;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <Gift className="w-8 h-8 text-purple-500" />
          <span>Rewards Store</span>
        </h1>
        <p className="text-gray-600 mt-2">Redeem your hard-earned points for awesome rewards!</p>
      </div>

      {/* User Points Display */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Reward Balance</h3>
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8" />
              <span className="text-3xl font-bold">{userProfile?.rewardPoints || 0}</span>
              <span className="text-lg">points</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Overall Rating</p>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5" />
              <span className="text-xl font-bold">{userProfile?.rating || 0}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredRewards.map(reward => (
          <div
            key={reward.id}
            className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{reward.icon}</div>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {reward.category}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">{reward.cost}</span>
                  <span className="text-sm text-gray-600">points</span>
                </div>
                
                {isRewardClaimed(reward.id) && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Claimed</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleClaimReward(reward)}
                disabled={!canAfford(reward.cost) || isRewardClaimed(reward.id)}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  isRewardClaimed(reward.id)
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : canAfford(reward.cost)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isRewardClaimed(reward.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Claimed</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {canAfford(reward.cost) ? 'Claim Reward' : 'Insufficient Points'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Claimed Rewards History */}
      {claimedRewards.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claimed Rewards</h3>
          <div className="space-y-3">
            {claimedRewards.map(claimed => (
              <div key={claimed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{claimed.rewardName}</p>
                  <p className="text-sm text-gray-600">
                    Claimed on {claimed.claimedAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">-{claimed.cost} points</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    claimed.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {claimed.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards in this category</h3>
          <p className="text-gray-600">Try selecting a different category.</p>
        </div>
      )}
    </div>
  );
}

export default Rewards;