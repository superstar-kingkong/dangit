// components/FeedbackSystem.tsx
import React, { useState, useEffect } from 'react';
import { 
  Star, ThumbsUp, ThumbsDown, MessageCircle, Lightbulb, 
  Bug, Send, TrendingUp, Clock, CheckCircle, Zap 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { API_URL } from '../config';

interface FeedbackSystemProps {
  userId: string;
  darkMode?: boolean;
  onClose: () => void;
}

export function FeedbackSystem({ userId, darkMode = false, onClose }: FeedbackSystemProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'features'>('feedback');
  const [rating, setRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<any[]>([]);
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });

  const feedbackCategories = [
    { id: 'ui', label: '🎨 Design & UI', icon: '🎨' },
    { id: 'performance', label: '⚡ Speed & Performance', icon: '⚡' },
    { id: 'features', label: '✨ Features & Functionality', icon: '✨' },
    { id: 'bugs', label: '🐛 Bugs & Issues', icon: '🐛' },
    { id: 'general', label: '💬 General Feedback', icon: '💬' }
  ];

  const quickFeedback = [
    { emoji: '😍', label: 'Love it!', category: 'general', message: 'I love using DANGIT! Great app!' },
    { emoji: '🚀', label: 'Fast & Smooth', category: 'performance', message: 'The app is super fast and smooth!' },
    { emoji: '🤔', label: 'Could be better', category: 'general', message: 'The app is good but could use some improvements.' },
    { emoji: '🐛', label: 'Found a bug', category: 'bugs', message: 'I found a bug in the app.' },
    { emoji: '💡', label: 'Have an idea', category: 'features', message: 'I have a feature suggestion.' }
  ];

  // Load features for voting
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${API_URL}/api/features`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setFeatures(result.data || []);
      }
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const submitFeedback = async () => {
    if (!rating && !feedbackMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          feedback_type: 'rating',
          rating,
          message: feedbackMessage,
          category: selectedCategory
        })
      });

      if (response.ok) {
        setRating(0);
        setFeedbackMessage('');
        alert('Thank you for your feedback! 🙏');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFeature = async () => {
    if (!newFeature.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/api/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newFeature)
      });

      if (response.ok) {
        setNewFeature({ title: '', description: '' });
        loadFeatures();
        alert('Feature suggestion submitted! 🚀');
      }
    } catch (error) {
      console.error('Error submitting feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteFeature = async (featureId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${API_URL}/api/features/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ feature_id: featureId, vote_type: voteType })
      });

      if (response.ok) {
        loadFeatures(); // Refresh votes
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💬 Feedback & Ideas
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 space-x-1">
            {['feedback', 'features'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab === 'feedback' ? '⭐ Give Feedback' : '💡 Feature Ideas'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Quick Feedback */}
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Feedback
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickFeedback.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setFeedbackMessage(item.message);
                        setSelectedCategory(item.category);
                        setRating(item.emoji === '😍' ? 5 : item.emoji === '🚀' ? 4 : 3);
                      }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        darkMode
                          ? 'bg-gray-800 hover:bg-gray-700 text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-sm font-medium">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Rate Your Experience
                </h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 transition-all ${
                        star <= rating ? 'text-yellow-500 scale-110' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Category
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedCategory === category.id
                          ? 'bg-indigo-500 text-white'
                          : darkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tell us more (optional)
                </h3>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="What do you think about DANGIT? Any suggestions?"
                  className={`w-full h-24 p-3 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitFeedback}
                disabled={isSubmitting || (!rating && !feedbackMessage.trim())}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isSubmitting || (!rating && !feedbackMessage.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {isSubmitting ? 'Sending...' : '📤 Send Feedback'}
              </button>
            </div>
          )}

          {/* Feature Ideas Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Suggest New Feature */}
              <div className={`p-4 rounded-xl border-2 border-dashed ${
                darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  💡 Suggest a New Feature
                </h3>
                <input
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({...newFeature, title: e.target.value})}
                  placeholder="Feature title (e.g., Dark mode, Voice notes)"
                  className={`w-full p-3 rounded-lg border mb-3 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                  placeholder="Describe your idea..."
                  className={`w-full h-20 p-3 rounded-lg border mb-3 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={submitFeature}
                  disabled={isSubmitting || !newFeature.title.trim()}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    isSubmitting || !newFeature.title.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : '✨ Suggest Feature'}
                </button>
              </div>

              {/* Feature List */}
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🗳️ Vote on Feature Ideas
                </h3>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-4 rounded-xl border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {feature.feature_title}
                          </h4>
                          {feature.feature_description && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {feature.feature_description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {feature.votes_count} votes
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              feature.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : feature.status === 'in_development'
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {feature.status === 'completed' && '✅ Done'}
                              {feature.status === 'in_development' && '🚧 Building'}
                              {feature.status === 'planned' && '📋 Planned'}
                              {feature.status === 'suggested' && '💭 Suggested'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-3">
                          <button
                            onClick={() => voteFeature(feature.id, 'upvote')}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-green-400' 
                                : 'hover:bg-gray-100 text-green-600'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => voteFeature(feature.id, 'downvote')}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-red-400' 
                                : 'hover:bg-gray-100 text-red-600'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
