import os
import requests

url = os.environ.get('VITE_SUPABASE_URL')
key = os.environ.get('VITE_SUPABASE_ANON_KEY')
# Actually, I can't query pg_policies via REST api without a function.
