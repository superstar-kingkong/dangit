import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { scrapeURL, analyzeWithAI } from '@/lib/content-processor'

// Helper function to extract domain - MOVE TO TOP
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { content, contentType, userId } = await request.json()
    
    let processedContent
    
    if (contentType === 'url') {
      // Scrape the URL first
      const scrapedData = await scrapeURL(content)
      // Then analyze with AI
      processedContent = await analyzeWithAI(scrapedData, 'url')
    } else if (contentType === 'image') {
      // Analyze image directly with AI Vision
      processedContent = await analyzeWithAI(content, 'image')
    } else {
      // Handle text content
      processedContent = await analyzeWithAI({ title: content, description: content }, 'text')
    }
    
    // Save to database - EGRESS OPTIMIZED ✅
    const { data, error } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        title: processedContent.title,
        content_type: contentType,
        original_content: null, // ✅ No massive content
        preview_data: contentType === 'url' ? { // ✅ Lightweight metadata
          url: typeof content === 'string' ? content : content.url,
          title: processedContent.title,
          description: processedContent.summary,
          domain: extractDomain(typeof content === 'string' ? content : content.url)
        } : null,
        ai_summary: processedContent.summary,
        ai_category: processedContent.category,
        ai_tags: processedContent.tags,
        is_completed: false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save item' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Failed to process content' }, { status: 500 })
  }
}
