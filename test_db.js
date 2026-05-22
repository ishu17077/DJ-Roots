import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: rooms, error } = await supabase.from('rooms').select('*').limit(1);
  if (error) {
    console.error('Error fetching rooms:', error);
  } else {
    console.log('Rooms columns:', Object.keys(rooms[0] || {}));
  }
}

test();
