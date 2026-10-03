-- Create payment settings table
CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upi_id TEXT,
    upi_qr_url TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated users to read payment settings" ON public.payment_gateway_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to insert/update
CREATE POLICY "Allow admins to modify payment settings" ON public.payment_gateway_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Insert default row if not exists
INSERT INTO public.payment_gateway_settings (upi_id, bank_name, account_name, account_number, ifsc_code)
SELECT 'prudentia@icici', 'ICICI Bank', 'PRUDENTIA COLLEGE OF LAW', '024305013005', 'ICIC0000243'
WHERE NOT EXISTS (SELECT 1 FROM public.payment_gateway_settings);
