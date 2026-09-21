import asyncio
from supabase import create_client

import os
url = os.environ.get('VITE_SUPABASE_URL', '')
key = os.environ.get('VITE_SUPABASE_ANON_KEY', '')

# We don't have the env vars loaded here natively if they are in .env
# Let's grep the .env file instead.
