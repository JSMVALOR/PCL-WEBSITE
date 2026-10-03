ALTER TABLE public.fee_transactions
ADD COLUMN IF NOT EXISTS reference_number text,
ADD COLUMN IF NOT EXISTS transfer_date text;
