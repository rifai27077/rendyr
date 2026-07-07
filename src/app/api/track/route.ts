import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isDummySupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, productId } = body;

    if (!type || !['page_view', 'whatsapp_click'].includes(type)) {
      return NextResponse.json({ error: 'Tipe tracking tidak valid' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Process Product Table Increments (If productId is passed)
    if (productId) {
      if (type === 'page_view') {
        // Increment product views
        const { error: prodError } = await supabaseAdmin.rpc('increment_product_views', {
          prod_id: productId,
        });

        if (prodError) {
          // Fallback if RPC function does not exist yet (direct column update)
          // Note: In a real system, setting up an RPC is preferred for atomic increments
          const { data: currentProd } = await supabaseAdmin
            .from('products')
            .select('views')
            .eq('id', productId)
            .single();

          if (currentProd) {
            await supabaseAdmin
              .from('products')
              .update({ views: (currentProd.views || 0) + 1 })
              .eq('id', productId);
          }
        }
      } else if (type === 'whatsapp_click') {
        // Increment product WA clicks
        const { error: prodError } = await supabaseAdmin.rpc('increment_product_whatsapp', {
          prod_id: productId,
        });

        if (prodError || isDummySupabase) {
          // Fallback
          const { data: currentProd } = await supabaseAdmin
            .from('products')
            .select('whatsapp_clicks')
            .eq('id', productId)
            .single();

          if (currentProd) {
            await supabaseAdmin
              .from('products')
              .update({ whatsapp_clicks: (currentProd.whatsapp_clicks || 0) + 1 })
              .eq('id', productId);
          }
        }
      }
    }

    // 2. Process Daily Aggregated Metrics on analytics_daily table
    // Try to insert a row for today, if conflicts (already exists), update the count
    const { data: existingRow, error: selectError } = await supabaseAdmin
      .from('analytics_daily')
      .select('date, page_views, whatsapp_clicks')
      .eq('date', todayStr)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching analytics_daily:', selectError);
    }

    if (existingRow) {
      // Update existing day stats
      const updates: Record<string, number> = {};
      if (type === 'page_view') {
        updates.page_views = (existingRow.page_views || 0) + 1;
      } else {
        updates.whatsapp_clicks = (existingRow.whatsapp_clicks || 0) + 1;
      }

      await supabaseAdmin
        .from('analytics_daily')
        .update(updates)
        .eq('date', todayStr);
    } else {
      // Create new row for today
      const newRow = {
        date: todayStr,
        page_views: type === 'page_view' ? 1 : 0,
        whatsapp_clicks: type === 'whatsapp_click' ? 1 : 0,
      };
      
      await supabaseAdmin
        .from('analytics_daily')
        .insert([newRow]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
