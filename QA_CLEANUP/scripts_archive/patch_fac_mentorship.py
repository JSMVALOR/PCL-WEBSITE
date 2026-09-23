import re

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'r') as f:
    content = f.read()

# Add grievances state
content = content.replace("const [appeals, setAppeals] = useState([]);", "const [appeals, setAppeals] = useState([]);\n    const [grievances, setGrievances] = useState([]);")

fetch_logic = """
            // 5. Fetch Grievances assigned to this mentor
            const { data: grievData } = await supabase
                .from('grievances')
                .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name), accused:profiles!grievances_accused_id_fkey(full_name)')
                .eq('assigned_to', facultyId)
                .order('created_at', { ascending: false });
            if (grievData) setGrievances(grievData);
"""
content = content.replace("} catch (error) {", fetch_logic + "\n        } catch (error) {")

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'w') as f:
    f.write(content)
