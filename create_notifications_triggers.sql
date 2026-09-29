-- Notify admins on new profile update request
CREATE OR REPLACE FUNCTION notify_admins_on_profile_request()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    student_name TEXT;
BEGIN
    SELECT full_name INTO student_name FROM profiles WHERE id = NEW.student_id;
    
    FOR admin_id IN SELECT id FROM profiles WHERE role = 'admin' LOOP
        INSERT INTO notifications (recipient_id, title, message, type, action_link)
        VALUES (
            admin_id,
            'Profile Update Request',
            student_name || ' has requested a profile update.',
            'system',
            'adminapprovals'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_admins_profile ON profile_update_requests;
CREATE TRIGGER trigger_notify_admins_profile
AFTER INSERT ON profile_update_requests
FOR EACH ROW
EXECUTE FUNCTION notify_admins_on_profile_request();


-- Notify admins on new faculty leave request
CREATE OR REPLACE FUNCTION notify_admins_on_leave_request()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    fac_name TEXT;
BEGIN
    SELECT full_name INTO fac_name FROM profiles WHERE id = NEW.faculty_id;
    
    FOR admin_id IN SELECT id FROM profiles WHERE role = 'admin' LOOP
        INSERT INTO notifications (recipient_id, title, message, type, action_link)
        VALUES (
            admin_id,
            'Faculty Leave Request',
            fac_name || ' has applied for leave.',
            'leave',
            'adminapprovals'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_admins_leave ON faculty_leave_requests;
CREATE TRIGGER trigger_notify_admins_leave
AFTER INSERT ON faculty_leave_requests
FOR EACH ROW
EXECUTE FUNCTION notify_admins_on_leave_request();


-- Notify admins on new escalated grievance
CREATE OR REPLACE FUNCTION notify_admins_on_escalated_grievance()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    reporter_name TEXT;
BEGIN
    SELECT full_name INTO reporter_name FROM profiles WHERE id = NEW.reporter_id;
    
    FOR admin_id IN SELECT id FROM profiles WHERE role = 'admin' LOOP
        INSERT INTO notifications (recipient_id, title, message, type, action_link)
        VALUES (
            admin_id,
            'Grievance Escalated',
            'A grievance by ' || reporter_name || ' has been escalated to admin.',
            'system',
            'adminapprovals'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_admins_grievance ON grievances;
CREATE TRIGGER trigger_notify_admins_grievance
AFTER UPDATE OF status ON grievances
FOR EACH ROW
WHEN (NEW.status = 'escalated' AND OLD.status != 'escalated')
EXECUTE FUNCTION notify_admins_on_escalated_grievance();


-- Also when directly inserted as escalated
DROP TRIGGER IF EXISTS trigger_notify_admins_grievance_insert ON grievances;
CREATE TRIGGER trigger_notify_admins_grievance_insert
AFTER INSERT ON grievances
FOR EACH ROW
WHEN (NEW.status = 'escalated')
EXECUTE FUNCTION notify_admins_on_escalated_grievance();

