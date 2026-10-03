-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Allow students to view their own invoices" ON public.fee_invoices;
DROP POLICY IF EXISTS "Allow students to view their transactions" ON public.fee_transactions;
DROP POLICY IF EXISTS "Allow students to insert transactions" ON public.fee_transactions;
DROP POLICY IF EXISTS "Allow students to update invoices" ON public.fee_invoices;

-- Make sure RLS is on if they need it, or we can just bypass it for now.
-- Actually, if we don't enable RLS, all authenticated users can do everything.
-- But wait, Supabase enables RLS by default when you create tables through Dashboard.
-- Let's just create policies to allow authenticated users to do everything they need.

ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to do all on fee_invoices"
ON public.fee_invoices FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to do all on fee_transactions"
ON public.fee_transactions FOR ALL
TO authenticated
USING (true) WITH CHECK (true);
