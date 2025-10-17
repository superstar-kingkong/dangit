import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request) {
  try {
    const { itemId, completed, userId } = await request.json()
    
    console.log('Toggle completion request:', { itemId, completed, userId })
    
    // Validate required fields
    if (!itemId || completed === undefined || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId, completed, userId' 
      }, { status: 400 })
    }

    // Update the item in database
    const { data, error } = await supabase
      .from('saved_items')
      .update({ 
        is_completed: completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('user_id', userId) // Ensure user can only update their own items
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to update item completion status' 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Item not found or access denied' 
      }, { status: 404 })
    }

    console.log('Successfully updated completion status:', data)
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: `Item ${completed ? 'completed' : 'marked as pending'}`
    })
    
  } catch (error) {
    console.error('Toggle completion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
