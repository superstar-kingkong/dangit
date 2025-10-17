import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(request) {
  try {
    const { itemId, userId, notifications } = await request.json()
    
    console.log('Update notification settings:', { itemId, userId, notifications })
    
    // Validate required fields
    if (!itemId || !userId || !notifications) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId, userId, notifications' 
      }, { status: 400 })
    }

    // First, check if the item exists and belongs to the user
    const { data: existingItem, error: fetchError } = await supabase
      .from('saved_items')
      .select('id, title')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json({ 
        error: 'Item not found or access denied' 
      }, { status: 404 })
    }

    // Update the item with notification settings
    // Note: You may need to add a notifications column to your saved_items table
    // For now, we'll store it as JSON in a text field
    const { data, error } = await supabase
      .from('saved_items')
      .update({ 
        // Add this column to your database: notifications JSONB
        notifications: JSON.stringify(notifications),
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to update notification settings' 
      }, { status: 500 })
    }

    console.log('Successfully updated notification settings:', data)
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Notification settings saved successfully'
    })
    
  } catch (error) {
    console.error('Update notification settings error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
