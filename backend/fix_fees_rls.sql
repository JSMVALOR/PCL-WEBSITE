ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view fee invoices" ON public.fee_invoices;
CREATE POLICY "Public can view fee invoices" ON public.fee_invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert fee invoices" ON public.fee_invoices;
CREATE POLICY "Public can insert fee invoices" ON public.fee_invoices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update fee invoices" ON public.fee_invoices;
CREATE POLICY "Public can update fee invoices" ON public.fee_invoices FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete fee invoices" ON public.fee_invoices;
CREATE POLICY "Public can delete fee invoices" ON public.fee_invoices FOR DELETE USING (true);
