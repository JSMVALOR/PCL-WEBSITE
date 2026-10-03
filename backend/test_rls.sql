SELECT pol.polname, pol.polpermissive, pol.polroles, pol.polcmd, pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class cla ON pol.polrelid = cla.oid
WHERE cla.relname = 'fee_invoices';
