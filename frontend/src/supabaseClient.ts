import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjlctxqdxcznmmoucosf.supabase.co';
const supabaseKey = 'sb_publishable_cDewsxHZ_-U9U1wQ6reyTQ_Oux0M5uv';

export const supabase = createClient(supabaseUrl, supabaseKey);
