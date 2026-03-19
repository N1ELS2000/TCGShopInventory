import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oivyotdqysmhtukijqzf.supabase.co";
const supabaseAnonKey = "sb_publishable_8_3kK7-NN5ER6dSZUKv3WQ_jiQdRGnY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);