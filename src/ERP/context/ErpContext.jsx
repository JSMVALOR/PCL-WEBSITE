/* © 2026 JSM VALOR. All Rights Reserved. */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../Shared/lib/supabase/supabaseClient';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ERP_ENCRYPTION_KEY || 'JSM_PCL_ENTERPRISE_AES_256_SECURE_KEY_v1';

const encryptSession = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptSession = (ciphertext) => {
    if (!ciphertext) return null;
    try {
        if (ciphertext.startsWith('{')) return null; // Old unencrypted format
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedString ? JSON.parse(decryptedString) : null;
    } catch (e) {
        return null;
    }
};

const ErpContext = createContext();
export const useERP = () => useContext(ErpContext);

// --- STRICT ROLE GUARD ---
const VALID_ROLES = ['student', 'faculty', 'admin'];

export const ErpProvider = ({ children }) => {
    // --- 1. INSTANT BOOT PROTOCOL (ZERO-LATENCY CACHE) ---
    const [userSession, setUserSession] = useState(() => {
        const cachedSession = localStorage.getItem('jsmerp_master_session');
        return decryptSession(cachedSession);
    });

    // If we found a cached session, do NOT show the initial app loading screen!
    const [isAppLoading, setIsAppLoading] = useState(() => {
        const cachedSession = localStorage.getItem('jsmerp_master_session');
        return !decryptSession(cachedSession);
    });

    // --- SESSION TIMEOUT LOGIC ---
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [sessionCountdown, setSessionCountdown] = useState(60);
    
    useEffect(() => {
        if (!userSession) return;

        let lastActivity = Date.now();
        let intervalId;

        const updateActivity = () => {
            // Only update activity if we aren't showing the warning modal
            // If the modal is shown, they MUST click "Continue Session" to reset it.
            if (!showSessionModal) {
                lastActivity = Date.now();
            }
        };

        const checkSession = () => {
            const now = Date.now();
            const idleTime = now - lastActivity;
            const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
            const WARNING_TIME_MS = 60 * 1000; // 60 seconds

            if (idleTime >= SESSION_TIMEOUT_MS) {
                logout();
            } else if (idleTime >= SESSION_TIMEOUT_MS - WARNING_TIME_MS) {
                if (!showSessionModal) {
                    setShowSessionModal(true);
                }
                setSessionCountdown(Math.max(0, Math.ceil((SESSION_TIMEOUT_MS - idleTime) / 1000)));
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(e => document.addEventListener(e, updateActivity, { passive: true }));

        intervalId = setInterval(checkSession, 1000);

        return () => {
            events.forEach(e => document.removeEventListener(e, updateActivity));
            clearInterval(intervalId);
        };
    }, [userSession, showSessionModal]);

    const continueSession = () => {
        setShowSessionModal(false);
        setSessionCountdown(60);
    };

    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);

    // --- 1.5 GLOBAL UI STATE ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const cachedState = localStorage.getItem('jsmerp_sidebar_collapsed');
        return cachedState === 'true';
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('jsmerp_sidebar_collapsed', String(newState));
            return newState;
        });
    };

    const [activeTheme, setActiveTheme] = useState(() => {
        let stored = localStorage.getItem('jsmerp_theme');
        if (stored === 'light') stored = 'marble-executive';
        if (stored === 'dark') stored = 'dark-luxury';
        if (stored) return stored;
        
        // Auto-detect system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark-luxury';
        }
        return 'marble-executive';
    });

    const [layoutPreference, setLayoutPreference] = useState(() => {
        return localStorage.getItem('jsmerp_layout') || 'topbar';
    });

    const changeLayout = (newLayout) => {
        setLayoutPreference(newLayout);
        localStorage.setItem('jsmerp_layout', newLayout);
    };

    const changeTheme = (newTheme) => {
        setActiveTheme(newTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', activeTheme);
        localStorage.setItem('jsmerp_theme', activeTheme);
        
        // Fix for Tailwind dark mode classes - seamlessly sync the 'dark' class 
        // with our semantic themes so all dark: and light modes work properly.
        if (activeTheme.includes('light') || ['marble-executive', 'structural-neo-brutalism'].includes(activeTheme)) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, [activeTheme]);

    // Navigation Layout State
    const [navLayout, setNavLayout] = useState(() => {
        return localStorage.getItem('jsmerp_nav_layout') || 'topnav'; // 'classic' | 'topnav'
    });

    const changeNavLayout = (layout) => {
        setNavLayout(layout);
        localStorage.setItem('jsmerp_nav_layout', layout);
    };

    // Sidebar Navigation Mode (Hubs vs Expanded)
    const [sidebarMode, setSidebarMode] = useState(() => {
        return localStorage.getItem('jsmerp_sidebar_mode') || 'hubs'; // 'hubs' | 'expanded'
    });

    const changeSidebarMode = (mode) => {
        setSidebarMode(mode);
        localStorage.setItem('jsmerp_sidebar_mode', mode);
    };

    // --- 2. SECURE PROFILE FETCHER (BACKGROUND REVALIDATION) ---
    const loadProfile = async (userId, userEmail) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1000)
                .eq('id', userId)
                .single();

            if (error || !profile) {
                await supabase.auth.signOut();
                throw new Error("Profile not found in database.");
            }

            const normalizedRole = profile.role?.toLowerCase().trim();

            // SECURITY HARDENING: Catch invalid database roles
            if (!VALID_ROLES.includes(normalizedRole)) {
                console.error(`CRITICAL: Invalid role "${profile.role}" for user ${userId}`);
                await supabase.auth.signOut();
                setUserSession(null);
                localStorage.removeItem('jsmerp_master_session'); // Purge bad cache
                throw new Error(`System Error: Unrecognized role '${profile.role}'. Contact Administration.`);
            }

            const sessionData = {
                id: profile.erp_id,
                db_id: userId,
                name: profile.full_name,
                email: profile.email || userEmail,
                role: normalizedRole,
                academic_batch: profile.academic_batch,
                questionnaire_completed: profile.questionnaire_completed || false,
                profile_picture_url: profile.profile_picture_url || null,
            };

            // Update UI and write to permanent cache securely
            setUserSession(sessionData);
            localStorage.setItem('jsmerp_master_session', encryptSession(sessionData));

        } catch (err) {
            console.error("Profile load failed:", err.message);
            setUserSession(null);
            localStorage.removeItem('jsmerp_master_session');
        } finally {
            setIsAppLoading(false);
        }
    };

    // --- 3. SINGLE-SOURCE AUTHENTICATION LISTENER ---
    useEffect(() => {
        let isMounted = true;

        // Failsafe: Guarantee the loading screen vanishes after 4 seconds
        const fallbackTimer = setTimeout(() => {
            if (isMounted) setIsAppLoading(false);
        }, 4000);

        // Check for active session on app boot (Background Check)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                if (isMounted) setIsAppLoading(false);
                return;
            }
            if (isMounted && session?.user) {
                loadProfile(session.user.id, session.user.email);
            } else if (isMounted) {
                setIsAppLoading(false);
                localStorage.removeItem('jsmerp_master_session'); // Cleanup dead sessions
            }
        });

        // Listen for Login / Logout events
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user) {
                loadProfile(session.user.id, session.user.email);
            } else {
                setUserSession(null);
                setNotices([]);
                setEvents([]);
                setIsAppLoading(false);
                localStorage.removeItem('jsmerp_master_session'); // Purge cache on logout
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(fallbackTimer);
            listener.subscription?.unsubscribe();
        };
    }, []);

    // --- 4. LIGHTNING-FAST LOGIN ENGINE ---
    const login = async (credential, password) => {
        try {
            let cleanCredential = credential.toLowerCase().trim();
            
            // Shorthand mapping removed for production security

            const emailToLogin = cleanCredential.includes('@')
                ? cleanCredential
                : `${cleanCredential}_v2@jsm.edu`;

            // Step 1: Check Auth Vault
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToLogin,
                password: password,
            });

            if (error) {
                return { success: false, error: { message: "Invalid credentials. Please verify your ID and password." } };
            }

            // Step 2: Ensure they exist in the Profiles table with a valid role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .limit(1000)
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                return { success: false, error: { message: "Account authenticated, but your Profile is missing in the database. Contact Admin." } };
            }

            const normalizedRole = profile.role?.toLowerCase().trim();

            if (!VALID_ROLES.includes(normalizedRole)) {
                await supabase.auth.signOut();
                return { success: false, error: { message: `System configuration error: Invalid role '${profile.role}'. Contact Administration.` } };
            }

            sessionStorage.removeItem('jsmerp_timer_start'); // Fresh timer for new session

            // Let the onAuthStateChange listener (which just fired) handle state & caching cleanly!
            return { success: true };

        } catch (err) {
            console.error("Login catch error:", err);
            return { success: false, error: { message: "Server error. Check internet connection." } };
        }
    };

    // --- 5. LOGOUT ACTION ---
    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('jsmerp_master_session'); // Hard purge cache
        sessionStorage.removeItem('jsmerp_timer_start'); // Clear session timer
        localStorage.removeItem('erp_otp_verified'); // Clear OTP state
    };

    // --- 6. GLOBAL NOTICES & PUSH NOTIFICATIONS ---
    useEffect(() => {
        if (userSession) {
            const role = userSession.role;
            const filterNotice = (n) => {
                if (role === 'admin') return true;
                if (n.author_id === (userSession.db_id || userSession.id)) return true;
                
                // If the backend sent JSON array
                let targets = [];
                try {
                    if (Array.isArray(n.target_audience)) targets = n.target_audience;
                    else if (typeof n.target_audience === 'string') {
                        if (n.target_audience.startsWith('[')) targets = JSON.parse(n.target_audience);
                        else targets = [n.target_audience];
                    }
                } catch (e) {
                    targets = [n.target_audience];
                }

                if (!targets || targets.length === 0) return true; // Fallback show all if malformed

                if (targets.includes('Global') || targets.includes('global')) return true;
                if (role === 'student' && (targets.includes('Student') || targets.includes('student'))) return true;
                if (role === 'faculty' && (targets.includes('Faculty') || targets.includes('faculty'))) return true;
                
                if (role === 'student' && userSession.academic_batch && targets.includes(userSession.academic_batch)) return true;
                if (userSession.erp_id && targets.includes(userSession.erp_id)) return true;

                return false;
            };

            // Initial fetch
            supabase.from('notices').select('*').limit(500).order('created_at', { ascending: false })
                .then(({ data }) => { 
                    if (data) {
                        setNotices(data.filter(filterNotice));
                    }
                });

            supabase.from('admin_events').select('*').limit(500).order('event_date', { ascending: true })
                .then(({ data }) => {
                    if (data) setEvents(data);
                });

            // Request Push Notification Permission
            if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }

            // Realtime Listener for new notices (Push Notifications)
            const noticeChannel = supabase.channel('realtime_notices')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, (payload) => {
                    const newNotice = payload.new;
                    if (filterNotice(newNotice)) {
                        setNotices(prev => [newNotice, ...prev]);
                        
                        // Trigger Native Push Notification with Throttling
                        if ("Notification" in window && Notification.permission === "granted") {
                            window._lastNotifTime = window._lastNotifTime || 0;
                            if (Date.now() - window._lastNotifTime > 2000) {
                                new Notification(`New Notice: ${newNotice.title}`, {
                                    body: newNotice.content,
                                    icon: '/favicon.ico'
                                });
                                window._lastNotifTime = Date.now();
                            }
                        }
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(noticeChannel);
            };
        }
    }, [userSession]);

    // --- 7. LEGACY FALLBACKS (Prevents components from crashing if they use old features) ---
    const [attendanceCache, setAttendanceCache] = useState({});
    const updateAttendanceCache = (id, data) => setAttendanceCache(prev => ({ ...prev, [id]: data }));
    const clearAttendanceCache = () => setAttendanceCache({});
    // --- 8. GLOBAL TIMETABLE ENGINE (Zero‑Latency) ---
    const [globalTimetable, setGlobalTimetable] = useState({}); // { batchId: { day: { time: slotObj } } }
    const [facultyTimetable, setFacultyTimetable] = useState([]); // array of slots for logged‑in faculty

    // Fetch master timetable for all batches (admin view)
    useEffect(() => {
        if (!userSession) return;
        const fetchMaster = async () => {
            try {
                const { data, error } = await supabase.from('class_schedule').select('*');
                if (error) throw error;
                // Organize into nested object for fast lookup
                const organized = {};
                data.forEach(slot => {
                    const batch = slot.batch_id || 'DEFAULT';
                    organized[batch] = organized[batch] || {};
                    organized[batch][slot.day_of_week] = organized[batch][slot.day_of_week] || {};
                    organized[batch][slot.day_of_week][slot.start_time] = slot;
                });
                setGlobalTimetable(organized);
            } catch (e) {
                console.error('Failed to load global timetable', e);
            }
        };
        fetchMaster();
    }, [userSession]);

    // Fetch faculty‑specific schedule
    useEffect(() => {
        if (!userSession?.db_id) return;
        const fetchFaculty = async () => {
            try {
                const { data, error } = await supabase
                    .from('class_schedule')
                    .select('*, subjects(name, code)')
                    .eq('faculty_id', userSession.db_id)
                    .order('start_time', { ascending: true });
                if (error) throw error;
                setFacultyTimetable(data || []);
            } catch (e) {
                console.error('Failed to load faculty timetable', e);
            }
        };
        fetchFaculty();
    }, [userSession]);

    // Helper getters
    const getTimetableForBatch = (batchId) => globalTimetable[batchId] || {};
    const getFacultySlots = () => facultyTimetable;
    const refreshProfile = async () => {
        if (!userSession?.db_id || !userSession?.email) return;
        await loadProfile(userSession.db_id, userSession.email);
    };

    return (
        <ErpContext.Provider value={{
            userSession,
            isAppLoading,
            toggleSidebar,
            isSidebarCollapsed,
            activeTheme,
            changeTheme,
            layoutPreference,
            changeLayout,
            navLayout,
            changeNavLayout,
            sidebarMode,
            changeSidebarMode,
            login,
            logout,
            refreshProfile,
            notices,
            addNotice: async (notice) => {
            if (!userSession) return;
            try {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                const insertData = {
                    notice_id: noticeId,
                    title: notice.title,
                    category: notice.category || 'General',
                    target_audience: notice.target_audience || notice.target_role || 'global',
                    target_id: notice.target_id || null,
                    priority: notice.priority || 'normal',
                    content: notice.content,
                    author_name: notice.author_name || userSession.name,
                    author_id: userSession.db_id
                };
                const { data, error } = await supabase.from('notices').insert([insertData]).select();
                if (error) throw error;
                // realtime listener handles state update, but we can optimistically update
                if (data && data.length > 0) {
                    setNotices(prev => [data[0], ...prev]);
                }
                return { success: true, data };
            } catch (e) {
                console.error('Add notice failed', e);
                return { success: false, error: e };
            }
        }, deleteNotice: async (id) => {
            if (!userSession) return;
            try {
                const { error } = await supabase.from('notices').delete().eq('id', id);
                if (error) throw error;
                setNotices(prev => prev.filter(n => n.id !== id));
                return { success: true };
            } catch (e) {
                console.error('Delete notice failed', e);
                return { success: false, error: e };
            }
        }, refreshNotices: async () => {
            if (!userSession) return;
            try {
                const { data, error } = await supabase.from('notices').select('*').limit(500).order('created_at', { ascending: false });
                if (error) throw error;
                setNotices(data);
                return { success: true, data };
            } catch (e) {
                console.error('Refresh notices failed', e);
                return { success: false, error: e };
            }
        },
        events, addEvent: async (eventData) => {
            if (!userSession) return { success: false };
            try {
                const insertData = {
                    title: eventData.title,
                    description: eventData.description,
                    event_date: eventData.event_date,
                    location: eventData.location || "TBA",
                    image_url: eventData.image_url || null,
                    is_public: eventData.is_public || false,
                    author_name: userSession.name,
                    author_id: userSession.db_id
                };
                const { data, error } = await supabase.from('admin_events').insert([insertData]).select();
                if (error) throw error;
                if (data && data.length > 0) {
                    setEvents(prev => [...prev, data[0]].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
                }
                return { success: true, data };
            } catch (e) {
                console.error('Add event failed', e);
                return { success: false, error: e };
            }
        }, deleteEvent: async (id) => {
            if (!userSession) return { success: false };
            try {
                const { error } = await supabase.from('admin_events').delete().eq('id', id);
                if (error) throw error;
                setEvents(prev => prev.filter(e => e.id !== id));
                return { success: true };
            } catch (e) {
                console.error('Delete event failed', e);
                return { success: false, error: e };
            }
        }, updateEventGallery: async (id, urls) => {
            if (!userSession) return { success: false };
            try {
                const { data, error } = await supabase.from('admin_events')
                    .update({ image_urls: urls })
                    .eq('id', id)
                    .select();
                if (error) throw error;
                if (data && data.length > 0) {
                    setEvents(prev => prev.map(e => e.id === id ? { ...e, image_urls: urls } : e));
                }
                return { success: true, data };
            } catch (e) {
                console.error('Update event gallery failed', e);
                return { success: false, error: e };
            }
        }, refreshEvents: async () => {
            if (!userSession) return;
            try {
                const { data, error } = await supabase.from('admin_events').select('*').limit(500).order('event_date', { ascending: true });
                if (error) throw error;
                setEvents(data);
                return { success: true, data };
            } catch (e) {
                console.error('Refresh events failed', e);
                return { success: false, error: e };
            }
        },
        batches: [], faculty: [], rooms: [], subjects: [], globalTimetable, facultyTimetable,
        getTimetableForBatch,
        getFacultySlots,
        // Attendance helpers
        fetchAttendance: async (batchId) => {
            if (!userSession) return;
            try {
                const { data, error } = await supabase.from('attendance').select('*').limit(2000).eq('batch_id', batchId);
                if (error) throw error;
                const byDay = {};
                data.forEach(rec => {
                    const day = rec.day_of_week || 'Unknown';
                    byDay[day] = byDay[day] || [];
                    byDay[day].push(rec);
                });
                setAttendanceCache(prev => ({ ...prev, [batchId]: byDay }));
            } catch (e) {
                console.error('Failed to load attendance', e);
            }
        },
        getAttendanceForDay: (batchId, day) => {
            return (attendanceCache[batchId] && attendanceCache[batchId][day]) || [];
        },
        requestLeave: async (classId, reason) => {
            if (!userSession) return { success: false };
            try {
                const { data, error } = await supabase.from('leave_requests').insert([
                    {
                        student_id: userSession.db_id,
                        class_id: classId,
                        reason,
                        status: 'pending'
                    }
                ]);
                if (error) throw error;
                return { success: true, data };
            } catch (e) {
                console.error('Leave request failed', e);
                return { success: false, error: e };
            }
        },
        approveLeave: async (requestId, decision) => {
            if (!userSession) return { success: false };
            try {
                const { data, error } = await supabase.from('leave_requests')
                    .update({ status: decision, reviewed_at: new Date().toISOString(), mentor_id: userSession.db_id })
                    .eq('id', requestId);
                if (error) throw error;
                return { success: true, data };
            } catch (e) {
                console.error('Leave approval failed', e);
                return { success: false, error: e };
            }
        },
        attendanceCache, updateAttendanceCache, clearAttendanceCache,
        assignSlot: async (data) => {
            const { error } = await supabase.from('faculty_timetable').insert([data]);
            if (error) throw error;
        },
        clearSlot: async (id) => {
            const { error } = await supabase.from('faculty_timetable').delete().eq('id', id);
            if (error) throw error;
        },
        submitAttendance: async (records) => {
            const { error } = await supabase.from('attendance').insert(records);
            if (error) throw error;
            clearAttendanceCache();
        },
        publishAssignment: async (data) => {
            const { error } = await supabase.from('assignments').insert([data]);
            if (error) throw error;
        },
        submitGrade: async (data) => {
            const { error } = await supabase.from('student_grades').upsert([data], { onConflict: 'student_id,assignment_id' });
            if (error) throw error;
        },
        submitMarksToCOE: async (assignmentId) => {
            const { error } = await supabase.from('student_grades').update({ is_submitted_to_coe: true }).eq('assignment_id', assignmentId);
            if (error) throw error;
        },
        processStudentRequest: async (id, status, resolverId) => {
            const { error } = await supabase.from('student_requests').update({ status, resolved_by: resolverId }).eq('id', id);
            if (error) throw error;
        },
        processFacultyLeave: async (id, status, reviewerId) => {
            const { error } = await supabase.from('faculty_leave_requests').update({ status, reviewed_by: reviewerId }).eq('id', id);
            if (error) throw error;
        },
        submitFacultyLeave: async (data) => {
            const { error } = await supabase.from('faculty_leave_requests').insert([data]);
            if (error) throw error;
        },
        updateMeetingNotes: async (data) => {
            const { error } = await supabase.from('mentorship_notes').insert([data]);
            if (error) throw error;
        }
        }}>
            {children}

            {/* Session Timeout Modal */}
            {showSessionModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
                    <div className="bg-themePanel w-full max-w-sm rounded-[2rem] border border-themeBorder shadow-2xl p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                            <i className="fa-solid fa-clock text-3xl text-rose-500 animate-pulse"></i>
                        </div>
                        <h2 className="text-2xl font-black text-themeText tracking-tight mb-2">Session Expiring</h2>
                        <p className="text-sm font-medium text-themeTextSec leading-relaxed mb-6">
                            For your security, you will be logged out in <span className="text-rose-500 font-bold">{sessionCountdown} seconds</span> due to inactivity.
                        </p>
                        <div className="flex w-full gap-3">
                            <button type="button"
                                onClick={logout}
                                className="flex-1 py-3 rounded-xl bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText text-xs font-black uppercase tracking-wider transition-colors border border-themeBorderStrong"
                            >
                                Log Out
                            </button>
                            <button type="button"
                                onClick={continueSession}
                                className="flex-1 py-3 rounded-xl bg-themeAccent hover:bg-themeAccentMuted text-white text-xs font-black uppercase tracking-wider transition shadow-lg active:scale-95 border border-themeAccent"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ErpContext.Provider>
    );
};