import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      current_track:queue_items(song:songs(title, artist, img_url))
    `)
    .limit(1);
  console.log(error || data);
}
test();
