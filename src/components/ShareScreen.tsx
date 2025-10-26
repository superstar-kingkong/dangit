import React, { useEffect, useState } from 'react';
import { Instagram, Loader, CheckCircle, XCircle } from 'lucide-react';

interface ShareScreenProps {
  user: {
    email: string;
  } | null;
  onClose: () => void;
  onContentSaved: () => void;
  darkMode?: boolean;
}

export default function ShareScreen({ user, onClose, onContentSaved, darkMode }: ShareScreenProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleShare();
  }, []);

  const handleShare = async () => {
    try {
      // Get shared content from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const title = urlParams.get('title');
      const text = urlParams.get('text');
      const url = urlParams.get('url');

      // Also check sessionStorage (set by App.tsx)
      const storedContent = sessionStorage.getItem('dangit-shared-content');
      
      console.log('📥 Received share:', { title, text, url, storedContent });

      // Check if user is logged in
      if (!user || !user.email) {
        setStatus('error');
        setMessage('Please sign in to save content');
        setTimeout(() => {
          sessionStorage.removeItem('dangit-shared-content');
          onClose();
        }, 2000);
        return;
      }

      // Determine what was shared
      let contentToSave = url || storedContent || text || title;
      let contentType = 'text';

      if (url || storedContent?.startsWith('http')) {
        contentType = 'url';
        contentToSave = url || storedContent;
      }

      if (!contentToSave) {
        setStatus('error');
        setMessage('No content received');
        setTimeout(() => {
          onClose();
        }, 2000);
        return;
      }

      // Detect if it's Instagram
      const isInstagram = contentToSave.includes('instagram.com') || 
                         contentToSave.includes('instagr.am');

      setMessage(isInstagram ? '📸 Saving Instagram post...' : `Saving ${contentType}...`);

      // Save content
      const response = await fetch('https://dangit-backend.onrender.com/api/process-content-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToSave,
          contentType: contentType,
          userId: user.email
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(isInstagram ? '✅ Instagram post saved!' : '✅ Content saved!');
        
        // Clean up
        sessionStorage.removeItem('dangit-shared-content');
        
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
        
        // Notify parent and redirect
        setTimeout(() => {
          onContentSaved();
          onClose();
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to save');
      }

    } catch (error) {
      console.error('Share error:', error);
      setStatus('error');
      setMessage('❌ Failed to save. Please try again.');
      setTimeout(() => {
        sessionStorage.removeItem('dangit-shared-content');
        onClose();
      }, 2000);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
    }`}>
      <div className={`rounded-2xl shadow-xl p-8 max-w-md w-full text-center ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      }`}>
        {status === 'processing' && (
          <>
            <Loader className={`w-16 h-16 mx-auto mb-4 animate-spin ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <h2 className="text-2xl font-bold mb-2">Processing...</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Success!</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Redirecting to home...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Error</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Redirecting...
            </p>
          </>
        )}

        <div className={`mt-6 pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
          <Instagram className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Share Instagram posts, links, and more directly to DANGIT
          </p>
        </div>

        {/* Manual close button for errors */}
        {status === 'error' && (
          <button
            onClick={onClose}
            className={`mt-4 px-6 py-2 rounded-lg font-medium ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}