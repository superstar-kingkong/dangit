// src/lib/content-saver.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uxsyfqurxduzwbeyloya.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3lmcXVyeGR1endiZXlsb3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzU4MzYsImV4cCI6MjA3Mjk1MTgzNn0.IxHovu7QMUITp09pByWKJc6VTa6mWhP4Bg_R9pp3nqM'
);

const API_BASE = 'http://192.168.1.8:3001';

export async function saveContent(input, type, userId = 'current-user') {
  try {
    console.log('Saving content:', { input: typeof input === 'object' ? input.name : input.substring(0, 50), type });
    
    let processedData;
    let originalContent;
    
    if (type === 'url') {
      console.log('Processing URL:', input);
      
      // First scrape the URL
      const scrapeResponse = await fetch(`${API_BASE}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input })
      });
      
      if (!scrapeResponse.ok) {
        throw new Error(`Scrape failed: ${scrapeResponse.status}`);
      }
      
      const scrapedData = await scrapeResponse.json();
      console.log('Scraped data:', scrapedData);
      originalContent = input;
      
      // Then analyze with AI
      const analyzeResponse = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: scrapedData, contentType: 'url' })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.status}`);
      }
      
      processedData = await analyzeResponse.json();
      console.log('URL analysis result:', processedData);
      
    } else if (type === 'file') {
      console.log('Processing file:', input.name);
      
      // Process file and get data URL
      const fileData = await processFile(input);
      originalContent = fileData.content;
      
      // Analyze with AI
      const analyzeResponse = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileData.content, contentType: fileData.type })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error(`File analysis failed: ${analyzeResponse.status}`);
      }
      
      processedData = await analyzeResponse.json();
      console.log('File analysis result:', processedData);
      
    } else if (type === 'text') {
      console.log('Processing text content');
      
      originalContent = input;
      const analyzeResponse = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, contentType: 'text' })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error(`Text analysis failed: ${analyzeResponse.status}`);
      }
      
      processedData = await analyzeResponse.json();
      console.log('Text analysis result:', processedData);
      
    } else {
      throw new Error(`Unsupported content type: ${type}`);
    }
    
    // Validate processed data
    if (!processedData || !processedData.title) {
      throw new Error('Invalid analysis result - missing required fields');
    }
    
    console.log('Saving to database:', processedData);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        title: processedData.title,
        content_type: type,
        original_content: null, // Backend will handle content limiting
        ai_summary: processedData.summary || 'No summary generated',
        ai_category: processedData.category || 'Other',
        ai_tags: processedData.tags || [],
        is_completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Successfully saved to database:', data);
    
    return { 
      success: true, 
      data,
      message: `Saved as "${processedData.category}" with ${processedData.tags?.length || 0} tags`
    };
    
  } catch (error) {
    console.error('Save error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save content',
      message: 'Something went wrong while saving your content'
    };
  }
}

// File processing function
async function processFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      
      if (file.type.startsWith('image/')) {
        console.log('Processing image file:', file.name);
        resolve({
          type: 'image',
          content: result,
          title: file.name,
          description: `Image file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
        });
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        console.log('Processing text file:', file.name);
        resolve({
          type: 'text', 
          content: result,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: `Text file content (${(file.size / 1024).toFixed(1)}KB)`
        });
      } else {
        console.log('Processing other file type:', file.name);
        resolve({
          type: 'file',
          content: `File: ${file.name}`,
          title: file.name,
          description: `${file.type} file (${(file.size / 1024).toFixed(1)}KB)`
        });
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

// Helper function to validate URLs
export function isValidUrl(string) {
  try {
    const url = new URL(string.startsWith('http') ? string : 'https://' + string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Helper function to validate file types
export function isValidFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
}

// Test function you can call to verify backend connection
export async function testBackendConnection() {
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'test content', contentType: 'text' })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Backend connection test successful:', result);
      return { success: true, data: result };
    } else {
      console.error('Backend connection test failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Backend connection test error:', error);
    return { success: false, error: error.message };
  }
}