import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Instagram, Loader, CheckCircle, XCircle } from 'lucide-react';

interface ShareScreenProps {
  user: {
    email: string;
  } | null;
}

export default function ShareScreen({ user }: ShareScreenProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleShare();
  }, []);

  const handleShare = async () => {
    try {
      const title = searchParams.get('title');
      const text = searchParams.get('text');
      const url = searchParams.get('url');

      console.log('📥 Received share:', { title, text, url });

      // Check if user is logged in
      if (!user || !user.email) {
        setStatus('error');
        setMessage('Please sign in to save content');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Determine what was shared
      let contentToSave = url || text || title;
      let contentType = 'text';

      if (url) {
        contentType = 'url';
        contentToSave = url;
      }

      if (!contentToSave) {
        setStatus('error');
        setMessage('No content received');
        setTimeout(() => navigate('/'), 2000);
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
        setTimeout(() => navigate('/'), 1500);
      } else {
        throw new Error(result.error || 'Failed to save');
      }

    } catch (error) {
      console.error('Share error:', error);
      setStatus('error');
      setMessage('❌ Failed to save. Please try again.');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-indigo-600" />
            <h2 className="text-2xl font-bold mb-2">Processing...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to home...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Error</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}

        <div className="mt-6 pt-6 border-t">
          <Instagram className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className="text-xs text-gray-500">
            Share Instagram posts, links, and more directly to DANGIT
          </p>
        </div>
      </div>
    </div>
  );
}