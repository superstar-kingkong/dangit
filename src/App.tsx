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
import ShareScreen from './components/ShareScreen';

// User type for authentication
interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

type AppScreen = 'onboarding' | 'signup' | 'home' | 'search' | 'add' | 'profile' | 'editProfile' | 'share';
type MainScreen = 'home' | 'search' | 'add' | 'profile';

interface ContentItem {
  id: string;
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
  originalUrl?: string;
  aiSummary?: string;
  created_at?: string;
  notifications?: string | {
    enabled: boolean;
    frequency: 'once' | 'daily' | 'weekly';
    time: string;
    customMessage?: string;
  };
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('medium');

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
      if (!document.hidden) {
        setTimeout(() => setViewportHeight(window.innerHeight), 100);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url') || urlParams.get('text');
    
    if (sharedUrl) {
      console.log('🔗 Shared content detected:', sharedUrl);
      sessionStorage.setItem('dangit-shared-content', sharedUrl);
      
      if (isAuthenticated && currentUser) {
        console.log('✅ User authenticated - opening ShareScreen');
        setCurrentScreen('share');
      } else {
        console.log('⏳ User not authenticated - will redirect after login');
      }
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const pendingShare = sessionStorage.getItem('dangit-shared-content');
    
    if (pendingShare && isAuthenticated && currentUser && !showOnboarding && !showSignUp) {
      console.log('🚀 Processing pending share after authentication:', pendingShare);
      setCurrentScreen('share');
      
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isAuthenticated, currentUser, showOnboarding, showSignUp]);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoadingUser(true);
      
      try {
        const savedUser = localStorage.getItem('dangit-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          if (userData.email && userData.name) {
            if (!userData.id) {
              userData.id = userData.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            }
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setShowOnboarding(false);
            setShowSignUp(false);
            
            const pendingShare = sessionStorage.getItem('dangit-shared-content');
            if (pendingShare) {
              console.log('📱 User has pending share - will open ShareScreen');
              setCurrentScreen('share');
            } else {
              setCurrentScreen('home');
            }
            
            console.log('User session restored:', { 
              name: userData.name, 
              email: userData.email,
              id: userData.id 
            });
          } else {
            throw new Error('Invalid user data structure');
          }
        } else {
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

  const handleShare = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen('share');
      setIsTransitioning(false);
    }, 150);
  };

  const handleShowContentDetail = (content: any) => {
    const transformedContent: ContentItem = {
      ...content,
      id: typeof content.id === 'string' ? content.id : String(content.id),
      originalUrl: content.preview_data?.url || content.originalUrl || null,
      aiSummary: content.ai_summary || content.description,
      created_at: content.created_at || content.timestamp,
      notifications: content.notifications || {
        enabled: false,
        frequency: 'once' as const,
        time: '09:00',
        customMessage: ''
      }
    };
    
    setSelectedContent(transformedContent);
    setShowContentDetail(true);
  };

  const handleCloseContentDetail = () => {
    setShowContentDetail(false);
    setTimeout(() => setSelectedContent(null), 300);
  };
  
  const handleDarkModeToggle = useCallback((enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const handleProfileUpdate = useCallback((updatedProfile: Partial<User>) => {
    if (!currentUser) return;
    const newUserData = { ...currentUser, ...updatedProfile };
    setCurrentUser(newUserData);
    localStorage.setItem('dangit-user', JSON.stringify(newUserData));
    console.log('Profile updated:', { name: newUserData.name, email: newUserData.email });
  }, [currentUser]);

  const handleContentSaved = useCallback(() => {
    console.log('Content saved, triggering refresh for user:', currentUser?.email);
    if ((window as any).refreshHomeScreen) {
      (window as any).refreshHomeScreen();
    }
    if ((window as any).refreshSearchScreen) {
      (window as any).refreshSearchScreen();
    }
    handleNavigate('home');
  }, [currentUser]);

  const getUserId = useCallback(() => {
    if (!currentUser) {
      console.warn('No current user found, using anonymous ID');
      return 'anonymous-user';
    }
    console.log('Using user ID for API calls:', currentUser.email);
    return currentUser.email;
  }, [currentUser]);

  const handleContentUpdate = useCallback((updatedContent: ContentItem) => {
    console.log('Content updated in detail view:', updatedContent.title);
    if ((window as any).refreshHomeScreen) {
      (window as any).refreshHomeScreen();
    }
    if ((window as any).refreshSearchScreen) {
      (window as any).refreshSearchScreen();
    }
    setSelectedContent(updatedContent);
  }, []);

  // ✅ UPDATED: Responsive container with desktop support
  const containerClasses = useMemo(() => {
    const baseClasses = "relative min-h-screen overflow-hidden";
    const shadowClasses = "lg:shadow-xl xl:shadow-2xl";
    
    switch (screenSize) {
      case 'small':
        return `w-full max-w-[340px] md:max-w-full ${baseClasses} ${shadowClasses} mx-auto`;
      case 'large':
        return `w-full max-w-[428px] md:max-w-full ${baseClasses} ${shadowClasses} mx-auto`;
      default:
        return `w-full max-w-[390px] md:max-w-full ${baseClasses} ${shadowClasses} mx-auto`;
    }
  }, [screenSize]);

  if (isLoadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
          </h2>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen relative overflow-hidden ${darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob ${darkMode ? 'bg-purple-800' : 'bg-purple-300'}`}></div>
        <div className={`absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${darkMode ? 'bg-yellow-800' : 'bg-yellow-300'}`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${darkMode ? 'bg-pink-800' : 'bg-pink-300'}`}></div>
      </div>

      {/* ✅ UPDATED: Desktop-responsive container */}
      <div className={`${containerClasses} ${darkMode ? 'bg-gray-900' : 'bg-white'} md:flex md:flex-col md:h-screen`}>
        
        <div className={`absolute inset-0 bg-white z-50 transition-opacity duration-300 pointer-events-none ${isTransitioning ? 'opacity-20' : 'opacity-0'}`} />
        
        {showOnboarding && (
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <Onboarding onComplete={handleCompleteOnboarding} />
          </div>
        )}

        {showSignUp && (
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <SignUp onComplete={handleCompleteSignUp} />
          </div>
        )}

        {!showOnboarding && !showSignUp && isAuthenticated && currentUser && (
          <>
            {/* ✅ UPDATED: Content area with desktop padding removed, sidebar margin added */}
            <div className={`h-full pb-20 md:pb-0 md:flex-1 md:overflow-auto transition-all duration-300 ${isTransitioning ? 'opacity-70 scale-98' : 'opacity-100 scale-100'}`}>
              {/* ✅ NEW: Wrapper for desktop sidebar margin */}
              <div className="md:ml-64">


                {currentScreen === 'home' && (
                  <div className="animate-in fade-in-0 duration-300">
                    <HomeScreen 
                      onShowContentDetail={handleShowContentDetail}
                      onNavigate={handleNavigate}
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
                      onClose={() => handleContentSaved()}
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

                {currentScreen === 'share' && (
                  <div className="animate-in fade-in-0 duration-300">
                    <ShareScreen 
                      user={currentUser}
                      onClose={() => handleNavigate('home')}
                      onContentSaved={handleContentSaved}
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </div>
            

            {/* ✅ NEW: Desktop Sidebar */}
            {currentScreen !== 'editProfile' && currentScreen !== 'share' && (
              <div className={`hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border-r flex-col z-40`}>
                
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className={`${darkMode ? "text-indigo-300" : "text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"}`}>DANG</span>
                    <span className={`${darkMode ? "text-pink-300" : "text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text"}`}>IT</span>
                  </h1>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentUser?.name}
                  </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                  <button
                    onClick={() => handleNavigate('home')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentScreen === 'home'
                        ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">Home</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('search')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentScreen === 'search'
                        ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-medium">Search</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('add')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentScreen === 'add'
                        ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Add Content</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentScreen === 'profile'
                        ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Profile</span>
                  </button>
                </nav>
              </div>
            )}
            </div>

                {currentScreen !== 'editProfile' && currentScreen !== 'share' && (
                  <div className="md:hidden">
                    <BottomNavigation
                      currentScreen={
                        currentScreen === 'home' || 
                        currentScreen === 'search' || 
                        currentScreen === 'add' || 
                        currentScreen === 'profile' 
                          ? currentScreen 
                          : 'home'
                            }
                            onNavigate={handleNavigate}
                            darkMode={darkMode}
                            />
                          </div>
                        )}

            {/* ✅ UPDATED: Floating Add Button - Hidden on desktop */}
            {currentScreen !== 'add' && currentScreen !== 'editProfile' && currentScreen !== 'share' && !showContentDetail && (
              <div className="md:hidden">
                <FloatingAddButton onClick={() => handleNavigate('add')} />
              </div>
            )}
          </>
        )}

        {showContentDetail && selectedContent && (
          <>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in-0 duration-300" />
            <div className="animate-in slide-in-from-bottom-4 fade-in-0 duration-500">
              <ContentDetailView
                content={selectedContent}
                onClose={handleCloseContentDetail}
                onContentUpdate={handleContentUpdate}
                darkMode={darkMode}
                userId={currentUser?.email}
              />
            </div>
          </>
        )}

        {currentUser && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-24 left-4 bg-black text-white text-xs p-2 rounded opacity-50 z-30">
            User: {currentUser.name} ({currentUser.email})
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
