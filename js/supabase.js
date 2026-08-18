/* Shared Supabase client — loaded via CDN script before this file.
   The publishable key is safe to expose client-side (it is Supabase's
   public-facing key, scoped by the project's Row Level Security policies). */

const SUPABASE_URL = "https://hqsqxytnqsrhyqukdabb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ucu7zD-FrQ-sB4ahNNV_-Q_aOpWnNXJ";
const PROPERTY_IMAGES_BUCKET = "property-images";

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
