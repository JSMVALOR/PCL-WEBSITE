CREATE OR REPLACE FUNCTION public.get_email_by_erp_id(target_erp_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  found_email TEXT;
BEGIN
  SELECT email INTO found_email
  FROM public.profiles
  WHERE lower(erp_id) = lower(target_erp_id)
  LIMIT 1;
  
  RETURN found_email;
END;
$func$;
