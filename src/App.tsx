import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Onboarding } from './components/onboarding';
import { SignUp } from './components/sign-up';
import { HomeScreen } from './components/home-screen';
import { SearchScreen } from './components/search-screen';
import { AddContentScreen } from './components/add-screen';
import { ProfileScreen } from './components/profile-screen';
import { EditProfileScreen } from './components/edit-profile-screen';
import { ContentDetailView } from './components/content-detail-view';
import { BottomNavigation } from './components/bottom-navigation';
import { FloatingAddButton } from './components/floating-add-button';

// User type for authentication
interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

// FIXED: Updated types to match actual usage
type AppScreen = 'onboarding' | 'signup' | 'home' | 'search' | 'add' | 'profile' | 'editProfile';
type MainScreen = 'home' | 'search' | 'add' | 'profile';

// FIXED: Updated ContentItem interface to match ContentDetailView expectations
interface ContentItem {
  id: number; // Changed from string to number to match ContentDetailView
  type: string;
  title: string;
  description: string;
  tags: string[];
  timestamp: string;
  completed: boolean;
  category: string;
  borderColor: string;
  priority?: "high" | "medium" | "low";
  aiScore?: number;
  // Additional properties that ContentDetailView expects
  originalUrl?: string;
  aiSummary?: string;
  readingTime?: string;
  viewCount?: number;
  notifications?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

function AppContent() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Core app state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Content detail state
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Screen transition state for smooth animations
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Responsive viewport detection
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Handle viewport changes for better mobile experience
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      const width = window.innerWidth;
      
      setViewportHeight(newHeight);
      
      if (width < 375) setScreenSize('small');
      else if (width > 428) setScreenSize('large');
      else setScreenSize('medium');
    };

    const handleVisibilityChange = () => {
      // Handle iOS Safari viewport changes
      if (!document.hidden) {
        setTimeout(() => setViewportHeight(window.innerHeight), 100);
      }
    };

    // Add passive listeners for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check for existing user session on app start
  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoadingUser(true);
      
      try {
        const savedUser = localStorage.getItem('dangit-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Validate user data structure
          if (userData.email && userData.name) {
            // Generate a consistent ID based on email if not present
            if (!userData.id) {
              userData.id = userData.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            }
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setShowOnboarding(false);
            setShowSignUp(false);
            setCurrentScreen('home');
            
            console.log('User session restored:', { 
              name: userData.name, 
              email: userData.email,
              id: userData.id 
            });
          } else {
            throw new Error('Invalid user data structure');
          }
        } else {
          // No saved user, show onboarding
          setShowOnboarding(true);
          setCurrentScreen('onboarding');
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('dangit-user');
        setShowOnboarding(true);
        setCurrentScreen('onboarding');
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkUserSession();
  }, []);

  // Screen transition handlers with smooth animations
  const handleCompleteOnboarding = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setShowOnboarding(false);
      setShowSignUp(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleCompleteSignUp = (userData: Omit<User, 'id' | 'joinDate'>) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Set user data and save to localStorage
    const userWithDetails: User = {
      ...userData,
      id: userData.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
      joinDate: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    };
    
    setCurrentUser(userWithDetails);
    setIsAuthenticated(true);
    localStorage.setItem('dangit-user', JSON.stringify(userWithDetails));
    
    console.log('New user registered:', {
      name: userWithDetails.name,
      email: userWithDetails.email,
      id: userWithDetails.id
    });
    
    setTimeout(() => {
      setShowSignUp(false);
      setCurrentScreen('home');
      setIsTransitioning(false);
    }, 300);
  };

  const handleSignOut = () => {
    console.log('User signing out:', currentUser?.email);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dangit-user');
    setShowOnboarding(true);
    setCurrentScreen('onboarding');
  };

  const handleNavigate = (screen: MainScreen) => {
    if (currentScreen === screen || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 150);
  };
  
  const handleEditProfile = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen('editProfile');
      setIsTransitioning(false);
    }, 150);
  };

  // FIXED: Updated to match ContentDetailView expectations
  const handleShowContentDetail = (content: any) => {
    // Transform the content to match ContentDetailView interface
    const transformedContent: ContentItem = {
      ...content,
      id: typeof content.id === 'string' ? parseInt(content.id) : content.id,
      originalUrl: content.original_content || content.originalUrl,
      aiSummary: content.ai_summary || content.description,
      readingTime: '2 min read',
      viewCount: Math.floor(Math.random() * 100) + 1,
      notifications: {
        enabled: false,
        frequency: 'weekly' as const
      }
    };
    
    setSelectedContent(transformedContent);
    setShowContentDetail(true);
  };

  const handleCloseContentDetail = () => {
    setShowContentDetail(false);
    setTimeout(() => setSelectedContent(null), 300);
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback((enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Handle profile update
  const handleProfileUpdate = useCallback((updatedProfile: Partial<User>) => {
    if (!currentUser) return;
    
    const newUserData = { ...currentUser, ...updatedProfile };
    setCurrentUser(newUserData);
    localStorage.setItem('dangit-user', JSON.stringify(newUserData));
    
    console.log('Profile updated:', {
      name: newUserData.name,
      email: newUserData.email
    });
  }, [currentUser]);

  // Handle content refresh callback
  const handleContentSaved = useCallback(() => {
    console.log('Content saved, triggering refresh for user:', currentUser?.email);
    // Trigger refresh for all screens that show content
    if ((window as any).refreshHomeScreen) {
      (window as any).refreshHomeScreen();
    }
    if ((window as any).refreshSearchScreen) {
      (window as any).refreshSearchScreen();
    }
  }, [currentUser]);

  // Get user ID for API calls
  const getUserId = useCallback(() => {
    if (!currentUser) {
      console.warn('No current user found, using anonymous ID');
      return 'anonymous-user';
    }
    console.log('Using user ID for API calls:', currentUser.email);
    return currentUser.email;
  }, [currentUser]);

  // FIXED: App container structure for proper bottom navigation positioning
  const containerClasses = useMemo(() => {
    const baseClasses = "relative min-h-screen max-w-md mx-auto overflow-hidden";
    const shadowClasses = "shadow-xl lg:shadow-2xl";
    
    switch (screenSize) {
      case 'small':
        return `w-full max-w-[340px] ${baseClasses} ${shadowClasses}`;
      case 'large':
        return `w-full max-w-[428px] ${baseClasses} ${shadowClasses}`;
      default:
        return `w-full max-w-[390px] ${baseClasses} ${shadowClasses}`;
    }
  }, [screenSize]);

  // Show loading screen while checking user session
  if (isLoadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
          </h2>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full min-h-screen relative overflow-hidden ${darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}
    >
      {/* Premium background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob ${darkMode 
          ? 'bg-purple-800' 
          : 'bg-purple-300'
        }`}></div>
        <div className={`absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${darkMode 
          ? 'bg-yellow-800' 
          : 'bg-yellow-300'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${darkMode 
          ? 'bg-pink-800' 
          : 'bg-pink-300'
        }`}></div>
      </div>

      {/* FIXED: Main app container with proper structure for bottom navigation */}
      <div className={`${containerClasses} ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Global transition overlay */}
        <div 
          className={`absolute inset-0 bg-white z-50 transition-opacity duration-300 pointer-events-none ${
            isTransitioning ? 'opacity-20' : 'opacity-0'
          }`}
        />
        
        {/* Onboarding Flow */}
        {showOnboarding && (
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <Onboarding onComplete={handleCompleteOnboarding} />
          </div>
        )}

        {/* Sign Up Flow */}
        {showSignUp && (
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <SignUp onComplete={handleCompleteSignUp} />
          </div>
        )}

        {/* Main App Content */}
        {!showOnboarding && !showSignUp && isAuthenticated && currentUser && (
          <>
            {/* FIXED: Content area with proper bottom padding for navigation */}
            <div className={`h-full pb-20 transition-all duration-300 ${isTransitioning ? 'opacity-70 scale-98' : 'opacity-100 scale-100'}`}>
              {/* Current Screen with smooth transitions */}
              {currentScreen === 'home' && (
                <div className="animate-in fade-in-0 duration-300">
                  <HomeScreen 
                    onShowContentDetail={handleShowContentDetail}
                    darkMode={darkMode}
                    userId={currentUser?.email}
                  />
                </div>
              )}
              
              {currentScreen === 'search' && (
                <div className="animate-in fade-in-0 duration-300">
                  <SearchScreen 
                    onShowContentDetail={handleShowContentDetail}
                    darkMode={darkMode}
                    userId={currentUser?.email}
                  />
                </div>
              )}

              {currentScreen === 'add' && (
                <div className="animate-in fade-in-0 duration-300">
                  <AddContentScreen 
                    darkMode={darkMode}
                    userId={currentUser.email}
                    onContentSaved={handleContentSaved}
                    onClose={() => handleNavigate('home')}
                  />
                </div>
              )}
              
              {currentScreen === 'profile' && (
                <div className="animate-in fade-in-0 duration-300">
                  <ProfileScreen 
                    darkMode={darkMode}
                    onDarkModeToggle={handleDarkModeToggle}
                    onEditProfile={handleEditProfile}
                    userProfile={{
                      name: currentUser.name,
                      email: currentUser.email,
                      bio: `DANGIT user since ${currentUser.joinDate}. Organizing and saving content efficiently.`,
                      location: 'Unknown',
                      website: '',
                      joinDate: currentUser.joinDate,
                      level: 'Active User'
                    }}
                    onSignOut={handleSignOut}
                  />
                </div>
              )}
              
              {currentScreen === 'editProfile' && (
                <div className="animate-in fade-in-0 duration-300">
                  <EditProfileScreen 
                    onBack={() => setCurrentScreen('profile')}
                    userProfile={{
                      name: currentUser.name,
                      email: currentUser.email,
                      bio: `DANGIT user since ${currentUser.joinDate}. Organizing and saving content efficiently.`,
                      location: 'Unknown',
                      website: '',
                      joinDate: currentUser.joinDate,
                      level: 'Active User'
                    }}
                    onProfileUpdate={(updatedProfile) => {
                      handleProfileUpdate({
                        name: updatedProfile.name,
                        email: updatedProfile.email
                      });
                    }}
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>

            {/* FIXED: Enhanced Bottom Navigation with proper type handling */}
            {currentScreen !== 'editProfile' && (
              <BottomNavigation
                currentScreen={
                  // Ensure we only pass valid MainScreen types to BottomNavigation
                  currentScreen === 'home' || 
                  currentScreen === 'search' || 
                  currentScreen === 'add' || 
                  currentScreen === 'profile' 
                    ? currentScreen 
                    : 'home' // fallback
                }
                onNavigate={handleNavigate}
                darkMode={darkMode}
              />
            )}

            {/* Smart Floating Add Button */}
            {currentScreen !== 'add' && currentScreen !== 'editProfile' && !showContentDetail && (
              <FloatingAddButton onClick={() => handleNavigate('add')} />
            )}
          </>
        )}

        {/* Premium Content Detail View with backdrop blur */}
        {showContentDetail && selectedContent && (
          <>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in-0 duration-300" />
            
            {/* Detail View */}
            <div className="animate-in slide-in-from-bottom-4 fade-in-0 duration-500">
              <ContentDetailView
                content={selectedContent}
                onClose={handleCloseContentDetail}
                darkMode={darkMode}
              />
            </div>
          </>
        )}

        {/* User Info Debug (remove in production) */}
        {currentUser && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-24 left-4 bg-black text-white text-xs p-2 rounded opacity-50 z-30">
            User: {currentUser.name} ({currentUser.email})
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component
export default function App() {
  return <AppContent />;
}
