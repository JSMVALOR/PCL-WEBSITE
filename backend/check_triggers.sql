CREATE OR REPLACE FUNCTION public.check_triggers()
RETURNS TABLE (trigger_name name, event_object_table name, action_statement text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT t.trigger_name::name, t.event_object_table::name, t.action_statement::text
    FROM information_schema.triggers t
    WHERE t.event_object_table IN ('users', 'profiles');
END;
$$;
