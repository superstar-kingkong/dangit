import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId || userId === 'anonymous-user') {
      return NextResponse.json({ 
        error: 'Valid userId is required' 
      }, { status: 400 })
    }

    console.log('Fetching saved items for user:', userId)

    // Fetch user's saved items, ordered by creation date (newest first)
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch saved items' 
      }, { status: 500 })
    }

    console.log(`Found ${data?.length || 0} saved items for user:`, userId)
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })
    
  } catch (error) {
    console.error('Fetch saved items error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
