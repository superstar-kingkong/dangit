import React, { useState } from 'react';
import { 
  ArrowLeft, User, Mail, Calendar, Camera, Save, 
  Shield, Award, Edit3, Check, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface EditProfileScreenProps {
  onBack: () => void;
  userProfile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    joinDate: string;
    level: string;
  };
  onProfileUpdate: (profile: typeof userProfile) => void;
  darkMode?: boolean;
}

export function EditProfileScreen({ onBack, userProfile, onProfileUpdate, darkMode = false }: EditProfileScreenProps) {
  // Profile data with useState to track changes
  const [profile, setProfile] = useState(userProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the profile in the parent component
    onProfileUpdate(profile);
    
    setIsSaving(false);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      // In a real app, you'd show a confirmation dialog
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    setIsEditing(false);
    setHasChanges(false);
    // Reset profile data to original values
    setProfile(userProfile);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Status Bar */}
      <div className={`flex justify-between items-center px-6 pt-4 pb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>9:41</div>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
          </div>
          <div className={`ml-2 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>100%</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="p-2 bg-green-500/20 rounded-full hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-6 space-y-6">
          
          {/* Avatar Section */}
          <div className={`rounded-3xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {profile.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-orange-600">
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-semibold">12 day streak</span>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Member since {profile.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className={`rounded-2xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <User className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{profile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                  />
                ) : (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{profile.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                {isEditing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{profile.location}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website</label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter your website URL"
                    className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer">{profile.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className={`rounded-2xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Edit3 className="w-5 h-5 text-indigo-600" />
              Bio
            </h3>
            
            {isEditing ? (
              <Textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              />
            ) : (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Account Security */}
          <div className={`rounded-2xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-5 h-5 text-indigo-600" />
              Account Security
            </h3>
            
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Password</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last updated 2 months ago</p>
                </div>
                <Button variant="outline" size="sm" className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}>
                  Change
                </Button>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm" className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}>
                  Enable
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button for Mobile */}
          {isEditing && (
            <div className="sticky bottom-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}