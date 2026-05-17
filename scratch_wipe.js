import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gckwwhevzqvsakwtlmxz.supabase.co/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3d3aGV2enF2c2Frd3RsbXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzU0MzMsImV4cCI6MjA5NDU1MTQzM30.YV2Ap4VCY1yHOqtBrbKIWloqJKhrc-TFH68guFS7f9c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function wipeDatabase() {
  console.log('Wiping queue_items...');
  const { data: rooms } = await supabase.from('rooms').select('id');
  if (rooms && rooms.length > 0) {
    for (const r of rooms) {
       await supabase.from('queue_items').delete().eq('room_id', r.id);
       await supabase.from('rooms').update({ current_track_id: null }).eq('id', r.id);
    }
  }
  console.log('Done!');
}

wipeDatabase();
