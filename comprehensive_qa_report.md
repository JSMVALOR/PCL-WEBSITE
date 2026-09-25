# 🛡️ Comprehensive QA Audit Report
*Generated on Fri Sep 25 22:18:20 IST 2026*

## 1. Code Quality & Architecture
### Missing User-Facing Errors in Try/Catch
```
Frontend/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx:206:        } catch (error) {
Frontend/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx:79:            } catch (err) {
Frontend/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx:103:            } catch (e) {
Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:66:            } catch (err) {
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:189:            } catch (emailErr) {
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:401: } catch (err) {
Frontend/ERP/components/Student/Attendance/Attendance.jsx:56:    } catch (e) {
Frontend/ERP/components/Student/CVBuilder/CVBuilder.jsx:19: } catch (e) {
Frontend/ERP/components/Student/CVBuilder/CVBuilder.jsx:37: } catch (e) {
Frontend/ERP/components/Student/Mentorship/Mentorship.jsx:90:        } catch (error) {
Frontend/ERP/components/Student/Leave/Leave.jsx:261: } catch (err) {
Frontend/ERP/components/Student/Credentials/SecuritySettings.jsx:57:        } catch (error) {
Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyEditorModal.jsx:59:     } catch (e) {
Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:166: } catch (emailErr) {
Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:173: } catch (error) {
--
Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx:157: } catch (error) {
Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx:176:    } catch (error) {
--
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminWebsiteInquiries.jsx:90:                    } catch (e) { console.warn("Failed to send email reply", e); }
Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:112:        } catch (error) {
Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:80: } catch (error) {
Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:96: } catch (error) {
Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:210: } catch (error) {
Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:88: } catch (err) {
Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx:199:        } catch (error) {
Frontend/ERP/components/shared/DashboardWidgets/DashboardWorkSchedule.jsx:90:            } catch (err) {
Frontend/ERP/components/shared/DashboardWidgets/StudentTrajectoryChart.jsx:43:      } catch (err) {
Frontend/ERP/components/shared/DashboardWidgets/FacultyCourseHealth.jsx:44:      } catch (e) {
Frontend/ERP/components/shared/DashboardWidgets/AdminSystemVitals.jsx:36:      } catch (e) {
--
Frontend/ERP/components/shared/DashboardWidgets/FacultySyllabusProgression.jsx:35:        } catch (e) {
Frontend/ERP/components/shared/BirthdayWidget.jsx:41:            } catch (err) {
Frontend/ERP/components/shared/IntelligentBot.jsx:80:        } catch (e) {
Frontend/ERP/components/shared/IntelligentBot.jsx:92:        } catch (e) {
Frontend/ERP/components/Login/ParentLogin.jsx:31:        } catch (err) {
Frontend/ERP/components/Login/ParentLogin.jsx:85:        } catch (err) {
```

## 2. Interactive Elements
### Disabled Buttons without cursor-not-allowed
```
Frontend/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx:367:                        <button onClick={handleSaveResults} disabled={isSaving}
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:438:                                                <button onClick={() => handleAppealAction(appeal.id, true)} disabled={actionLoading === appeal.id} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-black transition-colors">Approve</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:439:                                                <button onClick={() => handleAppealAction(appeal.id, false)} disabled={actionLoading === appeal.id} className="flex-1 py-2 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-xl text-xs font-black transition-colors">Reject</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:470:                                                {g.status === 'pending' && <button onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Investigate</button>}
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:471:                                                <button onClick={async () => { const notes = await window.erpDialog.prompt("Resolution Notes:"); if(notes) handleGrievanceAction(g.id, 'resolved', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Resolve</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:472:                                                <button onClick={async () => { const notes = await window.erpDialog.prompt("Dismissal Reason:"); if(notes) handleGrievanceAction(g.id, 'dismissed', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Dismiss</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:473:                                                <button onClick={() => handleGrievanceAction(g.id, 'escalated_to_admin', 'Escalated by mentor')} disabled={actionLoading === g.id} className="w-full py-1.5 bg-themeAccent/10 text-themeAccent hover:bg-themeAccent/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-themeAccent/20">Escalate to Admin</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:566:                                                <button onClick={() => handleApplicationAction(app.id, 'approve')} disabled={actionLoading === app.id} className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Forward</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:567:                                                <button onClick={() => handleApplicationAction(app.id, 'reject')} disabled={actionLoading === app.id} className="flex-1 py-1.5 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Reject</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:590:                                                <button onClick={() => handleAchievementVerify(ach.id, 'approve')} disabled={actionLoading === ach.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Verify</button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:591:                                                <button onClick={() => handleAchievementVerify(ach.id, 'reject')} disabled={actionLoading === ach.id} className="flex-1 py-1.5 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Reject</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1156:                    <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'present') || (!editMode && record.entry_status === 'present') ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>P</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1157:                    <button type="button" onClick={() => handleAction('absent')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'absent') || (!editMode && record.entry_status === 'absent') ? 'bg-white dark:bg-themeElevated text-rose-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>A</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1158:                    <button type="button" onClick={() => handleAction('medical')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'medical') || (!editMode && (record.entry_status === 'medical' || record.entry_status === 'approved_leave')) ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>M</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1166:                            <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1167:                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1174:                            <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1175:                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:361: <button type="button" onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={isProcessing} className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Start Investigation</button>
Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:414: <button type="button" onClick={() => handleInternshipAction(i.id, 'approve')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Approve</button>
Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:415: <button type="button" onClick={() => handleInternshipAction(i.id, 'forward')} disabled={isProcessing} className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Fwd to Admin</button>
Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:416: <button type="button" onClick={() => handleInternshipAction(i.id, 'reject')} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:203:                                                <button onClick={() => handleAction(appeal, 'grant')} disabled={processingId === appeal.id} className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-black transition-colors">Grant</button>
Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:204:                                                <button onClick={() => handleAction(appeal, 'reject')} disabled={processingId === appeal.id} className="flex-1 py-3 bg-black/5 hover:bg-rose-500/10 border border-themeBorder dark:border-white/10 hover:border-rose-500/20 rounded-xl text-themeTextSec dark:text-white/50 hover:text-rose-500 text-xs font-black transition-colors">Reject</button>
Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:248:                                                    <button onClick={() => handleDebarAction(s, 'Reinstate')} disabled={processingId === s.id} className="mt-2 w-full py-3 bg-black/5 hover:bg-emerald-500/10 border border-themeBorder dark:border-white/10 hover:border-emerald-500/20 rounded-xl text-themeTextSec dark:text-white/50 hover:text-emerald-500 text-xs font-black transition-colors">Reinstate</button>
Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:352: <button type="button" disabled={isProcessing} onClick={() => setMaxCapacity(Math.max(1, maxCapacity - 1))} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-r border-black/5 dark:border-white/10 active:scale-95 disabled:opacity-50">
Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:358: <button type="button" disabled={isProcessing} onClick={() => setMaxCapacity(maxCapacity + 1)} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-l border-black/5 dark:border-white/10 active:scale-95 disabled:opacity-50">
Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx:400: <button type="button" onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={isProcessing} className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Start Investigation</button>
Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx:401: <button type="button" onClick={() => handleCallMeeting(g)} disabled={isProcessing} className="flex-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-themeText dark:text-white border border-amber-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Call Meeting</button>
Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx:261:                                        <button onClick={() => handleResolveRequest(req.id, false)} disabled={isResolving} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-black transition-colors border border-red-500/20">
Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx:264:                                        <button onClick={() => handleResolveRequest(req.id, true)} disabled={isResolving} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-colors shadow-lg shadow-blue-500/20">
```

## 3. UI & Design System
### Hardcoded Magic Numbers (Arbitrary Tailwind Width/Height)
```
Frontend/ERP/components/Faculty/FacultyClinicsHub/FacultyClinicsHub.jsx:18:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Faculty/FacultyClinicsHub/FacultyClinicsHub.jsx:62:                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-amber-500 rounded-t-full shadow-[0_-2px_10px_currentColor]"></div>
Frontend/ERP/components/Faculty/FacultyClinicsHub/FacultyClinicsHub.jsx:71:                <div className="flex-1 w-full overflow-visible min-h-[500px]">
Frontend/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx:215:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx:315:                    <div ref={payslipRef} className="w-[800px] bg-white p-10 flex flex-col font-sans text-black">
Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:354: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:366: className={`flex-1 min-w-[110px] px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.toLowerCase() ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:78:            <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:81:                <div className="w-full xl:w-[280px] shrink-0 h-auto xl:h-full pb-6 xl:pb-0 overflow-y-auto custom-scrollbar pr-2 lg:pr-4 xl:sticky xl:top-0 z-30 self-start xl:self-auto">
Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:124:                        <div className="w-full xl:w-[420px] h-[320px] shrink-0">
Frontend/ERP/components/Faculty/FacultyAdminHub/FacultyAdminHub.jsx:13:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:314: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:391: <div className="flex-1 w-full bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/5 dark:border-white/10 rounded-[2rem] flex flex-col animate-slide-in-right overflow-hidden min-h-[750px] relative">
Frontend/ERP/components/Faculty/FacultyAdvisingHub/FacultyAdvisingHub.jsx:13:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:296:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Faculty/FacultyMentorship/MenteeLeaves.jsx:106:                <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:841: <div className={`${!subjectContext ? 'w-full max-w-[1800px] mx-auto flex flex-col gap-8 pb-32 xl:pb-8' : 'flex flex-col gap-4'}`}>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:861: className={`flex-1 min-w-[110px] px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${activeTab === tab.id ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:873: <div className="flex-1 w-full relative min-h-[500px]">
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:998: <p className="text-[12px] font-medium text-themeTextSec mb-6 max-w-[220px] mx-auto relative z-10 leading-relaxed">Display this live code for students to mark themselves present.</p>
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1090: <div className="flex-1 flex flex-col h-[750px] bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1181:                        <button type="button" onClick={() => updateAttendance(student.id, 'arrived_late')} className="w-[160px] h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-themeTextSec hover:text-amber-500 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-themeElevated hover:shadow-sm transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5">
Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:1281:    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white/40 dark:bg-themePanel/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm animate-fade-in">
Frontend/ERP/components/Faculty/FacultyAttendance/SwipeableRosterDeck.jsx:38:        <div className="relative w-full h-[60vh] max-h-[550px] flex items-center justify-center">
Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:237: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx:393:        <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:317: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:446: <div className={`${theme.layout.panel} rounded-2xl overflow-hidden border-themeBorder dark:border-white/5 border-black/5 dark:border-white/5 relative min-h-[300px]`}>
Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:456: <table className="w-full text-left border-collapse min-w-[600px]">
Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:261:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Faculty/FacultyAcademicHub/FacultyAcademicHub.jsx:24:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Faculty/FacultyAcademicHub/FacultyAcademicHub.jsx:72:                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-themeAccent rounded-t-full shadow-[0_-2px_10px_currentColor]"></div>
Frontend/ERP/components/Faculty/FacultyAcademicHub/FacultyAcademicHub.jsx:81:                <div className="flex-1 w-full overflow-visible min-h-[500px]">
Frontend/ERP/components/Student/Attendance/Attendance.jsx:451: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Attendance/Attendance.jsx:563: <p className="text-[12px] font-medium text-themeTextSec truncate max-w-[150px]">{subject.course_code}</p>
Frontend/ERP/components/Student/Assignments/Assignments.jsx:164: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Achievements/Achievements.jsx:160: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Fees/Fees.jsx:198: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Fees/Fees.jsx:400: <div className="bg-themePanel border border-black/5 dark:border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden text-themeText dark:text-white flex flex-col justify-between min-h-[300px] lg:min-h-[350px] group hover:border-amber-500/30 transition duration-500">
Frontend/ERP/components/Student/Fees/Fees.jsx:534: <h3 className="text-sm lg:text-base font-black text-themeText dark:text-white tracking-tight leading-tight mb-1 truncate max-w-[200px] sm:max-w-md lg:max-w-xl" title={txn.purpose}>{txn.purpose}</h3>
Frontend/ERP/components/Student/CVBuilder/CVBuilder.jsx:636: <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-32 xl:pb-8 animate-fade-in selection:bg-themeElevated" id="cv-builder-shell">
Frontend/ERP/components/Student/CVBuilder/CVBuilder.jsx:751: <div id="cv-preview-container" className="w-full bg-white dark:bg-[#121212] rounded-[2rem] p-4 lg:p-8 flex justify-center items-start overflow-hidden min-h-[500px] relative">
Frontend/ERP/components/Student/MootCourt/MootCourt.jsx:8:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Student/MootCourt/MootCourt.jsx:15:                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
Frontend/ERP/components/Student/CourseVault/CourseVault.jsx:273:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/CourseVault/CourseVault.jsx:305:                        <div className="relative w-full md:w-auto md:min-w-[280px]">
Frontend/ERP/components/Student/ElectiveBidding/ElectiveBidding.jsx:71: <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-32 xl:pb-8 animate-fade-in">
Frontend/ERP/components/Student/StudentCareerHub/StudentCareerHub.jsx:36: <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
Frontend/ERP/components/Student/Internships/Internships.jsx:371: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Notices/Notices.jsx:380:        <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-transparent text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
Frontend/ERP/components/Student/StudentAcademicHub/StudentAcademicHub.jsx:24:            <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
Frontend/ERP/components/Student/Portfolio/Portfolio.jsx:12:            <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
Frontend/ERP/components/Student/StudentSupportHub/StudentSupportHub.jsx:33: <div className="relative z-20 w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32">
Frontend/ERP/components/Student/StudentDashboard/StudentDashboard.jsx:177:            <div className="relative z-20 w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
Frontend/ERP/components/Student/StudentDashboard/StudentDashboard.jsx:180:                <div className="w-full xl:w-[280px] flex flex-col shrink-0 h-auto xl:h-full pb-6 xl:pb-0 overflow-y-auto custom-scrollbar pr-2 lg:pr-4 xl:sticky xl:top-0 z-30 self-start xl:self-auto">
Frontend/ERP/components/Student/StudentProgressCard/StudentProgressCard.jsx:107:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8">
Frontend/ERP/components/Student/StudentProgressCard/StudentProgressCard.jsx:276:                                            <span className="text-xs font-semibold text-themeTextSec dark:text-white/60 truncate max-w-[120px]">
Frontend/ERP/components/Student/Approvals/StudentApprovals.jsx:222: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Leave/Leave.jsx:269: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Timetable/Timetable.jsx:403: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Student/Timetable/Timetable.jsx:415: className={`min-w-[110px] px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.toLowerCase() ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:196: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:240: <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx:601:                     <div className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] bg-white dark:bg-themePanel border border-black/[0.04] dark:border-white/[0.08] rounded-2xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-50 overflow-hidden flex flex-col p-1.5 shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] translate-y-2 group-hover/nav:translate-y-0">
Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx:646:                     <span className="text-[12px] font-bold text-white truncate max-w-[200px]">{click.text}</span>
Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx:655: <div className="flex flex-col xl:flex-row gap-6 items-stretch relative h-[calc(100vh-130px)] min-h-[600px] w-full">
Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx:658:     <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-3xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col h-full xl:w-[450px] shrink-0 relative overflow-hidden">
Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx:150:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx:86: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx:169: className="flex-1 bg-black/5 dark:bg-themeElevated/90 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent resize-none min-h-[80px]"
Frontend/ERP/components/Admin/UserManagement/AdminStudentCVModal.jsx:184: <div className="w-full max-w-[794px] bg-themePanel/85 backdrop-blur-2xl rounded-md overflow-hidden shrink-0" style={{ minHeight: '1123px' }}>
Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx:379: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx:470: <div className={`${theme.layout.panel} rounded-2xl rounded-2xl overflow-hidden border border-black/[0.04] dark:border-white/[0.08] min-h-[400px]`}>
Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx:474: <table className="w-full text-left border-collapse min-w-[800px]">
Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx:120: <div className="absolute top-0 right-0 w-full max-w-[300px] md:w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
Frontend/ERP/components/Admin/AdminAcademicCalendar/AdminAcademicCalendar.jsx:266: className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent transition-colors min-h-[100px]"
Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx:94: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx:208: <div className="flex flex-col gap-3 min-w-[200px]">
Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx:268: <div className="flex flex-col gap-3 min-w-[200px]">
Frontend/ERP/components/Admin/AdminMootCourt/AdminMootCourt.jsx:8:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Admin/AdminMootCourt/AdminMootCourt.jsx:35:                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
Frontend/ERP/components/Admin/AdminLegalAid/AdminLegalAid.jsx:8:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Admin/AdminLegalAid/AdminLegalAid.jsx:33:                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
Frontend/ERP/components/Admin/notices/AdminNotices.jsx:355: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-32 xl:pb-8 ${!isHubView && 'px-4 lg:px-8'}`}>
Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx:113:                                <th key={col} className="p-4 text-xs font-bold text-themeText uppercase tracking-widest min-w-[150px] group relative">
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminWebsiteInquiries.jsx:103:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminWebsiteInquiries.jsx:165:                                                className="flex-1 bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent resize-none min-h-[80px]"
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx:331:            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx:386:                                            className="max-h-[400px] w-auto object-contain" 
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx:139: <textarea className="bg-black/5 dark:bg-themeElevated/90 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent min-h-[200px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Job description..."></textarea>
Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx:168: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx:25: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx:48: <div className="flex-1 w-full relative min-h-[500px]">
Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:448: className={`${theme.layout.panel} rounded-2xl border border-themeBorder dark:border-white/5 p-3 lg:p-4 h-[250px] lg:h-[600px] overflow-y-auto no-scrollbar flex flex-col gap-2 relative transition-colors ${snapshot.isDraggingOver ? 'bg-themeElevated/50 border-indigo-500' : ''}`}
Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:509: <div key={i} className={`${theme.layout.panel} rounded-2xl border border-themeBorder dark:border-white/5 flex flex-col overflow-hidden h-[300px] animate-pulse`}>
Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:547: className={`p-3 flex flex-col gap-2 flex-1 min-h-[120px] lg:min-h-[150px] max-h-[220px] lg:max-h-[300px] overflow-y-auto no-scrollbar transition ${snapshot.isDraggingOver ? (isFull ? 'bg-rose-500/10 border-t-[length:var(--border-width)] border-rose-500/30' : 'bg-emerald-500/10 border-t-[length:var(--border-width)] border-emerald-500/30') : ''}`}
Frontend/ERP/components/Admin/AdminMentorship/MentorshipTransfers.jsx:199: <div className="max-h-[300px] overflow-y-auto bg-white dark:bg-[#121212] backdrop-blur-2xl flex flex-col divide-y divide-themeBorder">
Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx:176:                                                    className={`w-full max-w-[250px] border rounded-lg px-3 py-2 text-sm font-bold outline-none appearance-none transition ${currentFaculty ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-black border-themeBorder dark:border-white/10 text-themeText dark:text-white'}`}
Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/SubjectBuilder.jsx:180:                    className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500 appearance-none min-w-[200px]"
Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:51: days.push(<div key={`blank-${i}`} className="min-h-[100px] border border-black/[0.04] dark:border-white/[0.08]/50 bg-black/5 dark:bg-white/5/30 rounded-xl"></div>);
Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:66: <div key={day} className={`min-h-[80px] lg:min-h-[100px] border-[length:var(--border-width)] rounded-xl p-1.5 lg:p-2 transition relative flex flex-col gap-1 overflow-hidden group
Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:73: <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] lg:max-h-[80px] no-scrollbar">
Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:93: <h2 className={`font-bold tracking-tight text-lg lg:text-xl text-themeText min-w-[140px] lg:w-48 text-center`}>{monthName} {year}</h2>
Frontend/ERP/components/Admin/LeaveManagement/LeaveRequests.jsx:99:                                            <span className="truncate max-w-[200px]">{req.reason}</span>
Frontend/ERP/components/Admin/LeaveManagement/AdminLeaveManagement.jsx:75: <div className="flex-1 w-full relative min-h-[500px]">
Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:221: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:345: <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-themeBorder dark:border-white/5 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[500px]">
Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:20: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:69: fixed xl:relative top-0 right-0 h-full xl:h-auto w-[320px] sm:w-[380px] xl:w-auto 
Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:63:            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:77:            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:91:            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:104:            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:117:            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
Frontend/ERP/components/Admin/AdminDashboard/SQLStudio.jsx:71: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminDashboard/SQLStudio.jsx:137: <span key={num} className="leading-relaxed h-[21px] flex items-center justify-center">{num}</span>
Frontend/ERP/components/Admin/AdminDashboard/AdminHeroBanner.jsx:49:            <div className="relative z-10 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 w-full lg:w-auto lg:min-w-[340px] shrink-0">
Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:126: <div className={`bg-themePanel/85 backdrop-blur-2xl rounded-2xl border border-themeBorder dark:border-white/5 p-5 flex flex-col min-h-[160px] relative`}>
Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx:39: <div className="w-full relative h-[360px]">
Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx:328:                        <button type="submit" className="h-[46px] px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx:517:                  <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx:544:                  <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:273: <div className="w-[1px] h-6 bg-themeBorderStrong mx-2"></div>
Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:329: <textarea required className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent min-h-[400px] font-mono" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write your blog post content here..."></textarea>
Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:349: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:394: <td className="p-4 text-xs font-bold text-themeText truncate max-w-[150px]">
Frontend/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx:57:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx:275: <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
Frontend/ERP/components/Admin/AdminClinicsHub/AdminClinicsHub.jsx:8:            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
Frontend/ERP/components/Admin/AdminClinicsHub/AdminClinicsHub.jsx:14:                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center min-h-[500px]">
Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx:593:                    <div ref={luxuryPayslipRef} className="w-[800px] h-[1131px] bg-white text-black p-8 flex flex-col justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
Frontend/ERP/components/shared/DashboardWidgets/DashboardWorkSchedule.jsx:154:                            className={`flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-white dark:bg-themeElevated shadow-sm scale-100 border border-black/5 dark:border-white/10' : 'hover:bg-white/50 dark:hover:bg-white/10 scale-95 opacity-80 hover:opacity-100'}`}
Frontend/ERP/components/shared/DashboardWidgets/DashboardWorkSchedule.jsx:207:                                <div key={idx} className={`shrink-0 flex flex-col p-3 rounded-xl min-w-[140px] max-w-[180px] transition-all cursor-default ${bgColor}`}>
Frontend/ERP/components/shared/DashboardWidgets/StudentTrajectoryChart.jsx:65:      <div className="h-[200px] w-full mt-4 relative">
Frontend/ERP/components/shared/DashboardWidgets/FacultyCourseHealth.jsx:65:                <span className="text-[10px] font-bold text-rose-500 tracking-widest truncate max-w-[150px]">Action Req: {alertCourse}</span>
Frontend/ERP/components/shared/DashboardWidgets/FacultyCourseHealth.jsx:75:      <div className="flex-1 w-full mt-4 relative min-h-[200px]">
Frontend/ERP/components/shared/DashboardWidgets/FacultyActionItems.jsx:94:        <div className="flex-1 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative flex flex-col shrink-0 h-[320px]">
Frontend/ERP/components/shared/DashboardWidgets/StudentActivityRings.jsx:136:        <div className="h-[180px] sm:h-[200px] w-full relative z-10 flex items-center justify-center">
Frontend/ERP/components/shared/DashboardWidgets/FacultySyllabusProgression.jsx:53:      <div className="flex-1 w-full relative min-h-[160px] py-4">
Frontend/ERP/components/shared/ErpSkeleton.jsx:8:      <div className="w-full h-[72px] lg:h-[84px] fixed top-0 left-0 border-b border-themeBorder bg-themePanel/50 backdrop-blur-md z-50 flex items-center justify-between px-4 lg:px-6">
Frontend/ERP/components/shared/ErrorBoundary.jsx:22:                <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-rose-500/20 m-4">
Frontend/ERP/components/shared/TopNav.jsx:96:            <header className="h-[72px] px-4 lg:px-8 flex items-center justify-between max-w-[2000px] mx-auto gap-4">
Frontend/ERP/components/shared/TopNav.jsx:159:                                            <div className="max-w-[1400px] mx-auto px-6 py-10 flex justify-between gap-16">
Frontend/ERP/components/shared/TopNav.jsx:162:                                                <div className="w-[300px] shrink-0">
Frontend/ERP/components/shared/TopNav.jsx:252:                                <span className="text-[13px] font-bold text-themeText group-hover/profile:text-themeAccent transition-colors duration-300 truncate max-w-[120px] tracking-tight">
Frontend/ERP/components/shared/TopNav.jsx:271:                                    <div className="bg-white dark:bg-themePanel border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-2xl p-4 min-w-[220px] flex flex-col gap-2 relative overflow-hidden">
Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:22:            <div className="bg-white dark:bg-themePanel border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-2xl w-[320px] flex flex-col relative overflow-hidden">
Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:28:                <div className="flex flex-col max-h-[360px] overflow-y-auto overscroll-contain">
Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:181:                    <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out pl-2 border-l border-black/5 dark:border-white/5 ml-4 mt-1 ${isSubmenuExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:258:                                <div className={`flex flex-col gap-0.5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isExpanded || isCompact ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
Frontend/ERP/components/shared/GlobalSearch.jsx:99:          <div className="max-h-[420px] overflow-y-auto p-3 scrollbar-hide">
Frontend/ERP/components/shared/WeeklyChart.jsx:47:            <div className="min-w-[1000px] bg-themeElevated/90 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden relative shadow-sm">
Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx:62:        <div className="flex-1 w-full relative h-full rounded-2xl overflow-hidden group min-w-[280px] lg:max-w-[400px] shadow-none border border-black/[0.04] dark:border-white/[0.08]">
Frontend/ERP/components/shared/OrganizationDirectory/OrganizationDirectory.jsx:87:            <div className="min-h-[400px]">
Frontend/ERP/components/shared/ToastContainer.jsx:73:            className="bg-themePanel dark:bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/10 text-themeText dark:text-white p-4 lg:p-5 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[320px] pointer-events-auto"
Frontend/ERP/components/shared/TargetAudienceSelector.jsx:97:            <div className="min-h-[100px] bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-5 flex flex-col gap-2 justify-center relative">
Frontend/ERP/components/shared/TargetAudienceSelector.jsx:183:                                                    {user.academic_batch && <span className="text-[10px] font-semibold text-themeTextSec truncate max-w-[100px]">• {user.academic_batch}</span>}
Frontend/ERP/components/shared/IntelligentBot.jsx:221:                <div className="w-[calc(100vw-2rem)] max-w-sm h-[550px] max-h-[80vh] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-3xl flex flex-col overflow-hidden animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)] relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-transparent before:pointer-events-none dark:before:bg-none">
Frontend/ERP/components/shared/NotificationsCenter/NotificationsCenter.jsx:77:        <div className="flex flex-col h-full animate-fade-in relative z-10 max-w-[1600px] mx-auto w-full">
Frontend/ERP/components/shared/MentorshipChatHub.jsx:129:            <div className={`fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-[calc(100vw-32px)] sm:w-[380px] h-[600px] max-h-[80vh] bg-themeApp/95 dark:bg-[#121212]/95 backdrop-blur-3xl saturate-[1.8] border border-black/10 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
Frontend/ERP/components/shared/WeeklyList.jsx:38:                            className={`snap-start min-w-[120px] px-4 py-3 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex flex-col items-center justify-center gap-1 ${activeDay === day ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
Frontend/ERP/components/shared/MobileNav.jsx:119:            <div className={`flex lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] h-[78px] bg-themePanel border border-black/10 dark:border-black/5 dark:border-white/10 rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.28)] z-40 px-2 flex justify-around items-center transition duration-500 ease-out ${isVisible || mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"}`} ref={navRef}>
Frontend/ERP/components/shared/MobileNav.jsx:123:                    className="absolute bottom-[11px] h-[56px] rounded-[18px] transition duration-[0.45s] z-10"
Frontend/ERP/components/shared/MobileNav.jsx:137:                            className={`nav-btn ${isActive ? 'active-nav-btn' : ''} flex flex-col items-center justify-center w-[56px] h-[56px] rounded-[18px] relative z-20 transition duration-[0.45s] ease-out border-none bg-transparent cursor-pointer ${isActive ? 'text-themeAccent -translate-y-2 scale-110' : 'text-themeTextSec'}`}
Frontend/ERP/components/shared/MobileNav.jsx:148:                    className={`nav-btn ${mobileMenuOpen ? 'active-nav-btn' : ''} flex flex-col items-center justify-center w-[56px] h-[56px] rounded-[18px] relative z-20 transition duration-[0.45s] ease-out border-none bg-transparent cursor-pointer ${mobileMenuOpen ? 'text-themeAccent -translate-y-2 scale-110' : 'text-themeTextSec'}`}
Frontend/ERP/components/shared/LiveHeaderComponents.jsx:26:        <div className="hidden md:flex items-center w-full max-w-[200px] lg:max-w-[240px] xl:max-w-[320px] group mx-2 lg:mx-4">
Frontend/ERP/components/shared/ZohoDashboard/ZohoLayout.jsx:23:            <div className="w-full h-[320px] relative">
Frontend/ERP/components/shared/ZohoDashboard/ZohoDepartmentMembers.jsx:6:        <div className="bg-[#18181A] rounded-xl border border-themeBorder dark:border-white/5 p-4 shadow-lg flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx:191:                <div className="max-w-[1200px] mx-auto animate-fade-in flex flex-col gap-6">
```

## 4. Accessibility (a11y)
### Icon-Only Buttons Missing aria-label
```
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyStudentProfile360.jsx:323: <button type="button" onClick={() => window.print()} className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-print text-themeText"></i></button>
Frontend/ERP/components/Faculty/FacultyMentorship/FacultyStudentProfile360.jsx:324: <button type="button" onClick={() => setShowCVModal(false)} className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-themeText"></i></button>
Frontend/ERP/components/Student/Attendance/Attendance.jsx:772:                            <button onClick={() => setShowAppealModal(false)} className="text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Achievements/Achievements.jsx:337: <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="text-themeTextSec dark:text-white/60 hover:text-themeAccent transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
Frontend/ERP/components/Student/Achievements/Achievements.jsx:338: <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="text-themeTextSec dark:text-white/60 hover:text-themeAccent transition-colors"><i className="fa-solid fa-ellipsis"></i></button>
Frontend/ERP/components/Student/Achievements/Achievements.jsx:518: <button type="button" onClick={() => setShowAddWizard(false)} className="text-themeTextSec dark:text-white/60 hover:text-themeText dark:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
Frontend/ERP/components/Student/Fees/Fees.jsx:232:             <div className="flex justify-between text-xs items-center"><span className="text-themeTextSec dark:text-white/60 font-medium">Account No.</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText dark:text-white tracking-tight">024305013005</span><button type="button" onClick={() => navigator.clipboard.writeText('024305013005')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
Frontend/ERP/components/Student/Fees/Fees.jsx:233:             <div className="flex justify-between text-xs items-center"><span className="text-themeTextSec dark:text-white/60 font-medium">IFSC Code</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText dark:text-white tracking-tight">ICIC0000243</span><button type="button" onClick={() => navigator.clipboard.writeText('ICIC0000243')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
Frontend/ERP/components/Student/Fees/Fees.jsx:244:                <button type="button" onClick={() => navigator.clipboard.writeText('prudentia@icici')} className="text-emerald-500 hover:text-emerald-600"><i className="fa-regular fa-copy"></i></button>
Frontend/ERP/components/Student/Internships/CLETracker.jsx:149: <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 text-themeTextSec hover:text-themeText hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Internships/Internships.jsx:637: <button type="button" onClick={() => setShowExpModal(false)} className="w-8 h-8 rounded-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] border-black/[0.04] dark:border-white/[0.08]BorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Internships/Internships.jsx:707: <button type="button" onClick={() => setShowPermModal(false)} className="w-8 h-8 rounded-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] border-black/[0.04] dark:border-white/[0.08]BorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Internships/Internships.jsx:757: <button type="button" onClick={() => setShowPracModal(false)} className="w-8 h-8 rounded-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] border-black/[0.04] dark:border-white/[0.08]BorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Internships/Internships.jsx:797: <button type="button" onClick={() => setShowDailyLogModal(false)} className="w-8 h-8 rounded-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] border-black/[0.04] dark:border-white/[0.08]BorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Internships/Internships.jsx:824: <button type="button" onClick={() => setShowLinkedInDraftModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Student/Timetable/Timetable.jsx:322: <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-[80px] border border-white/20 text-themeText dark:text-white hover:bg-themeBorder transition-colors"><i className="fa-solid fa-chevron-left text-xs"></i></button>
Frontend/ERP/components/Student/Timetable/Timetable.jsx:323: <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-[80px] border border-white/20 text-themeText dark:text-white hover:bg-themeBorder transition-colors"><i className="fa-solid fa-chevron-right text-xs"></i></button>
Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx:294: <button type="button" onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-themeElevated border border-black/[0.04] dark:border-white/[0.08] text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/shared/TargetAudienceSelector.jsx:150:                                            <button type="button" onClick={() => toggleItem(v)} className="hover:text-rose-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx:333:                                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 transition-colors"><i className="fa-solid fa-xmark"></i></button>
```

## 5. Linter Diagnostics (oxlint)
```

  x Unterminated string
     ,-[Frontend/ERP/components/Student/Credentials/ProfileEditModal.jsx:187:121]
 186 |      }
 187 | ,->  } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }`);
 188 | |    } finally {
 189 | |    setIsSubmitting(false);
 190 | |    }
 191 | |    };
 192 | |   
 193 | |    return (
 194 | |    <AnimatePresence>
 195 | |    <motion.div 
 196 | |    initial={{ opacity: 0, scale: 0.98 }}
 197 | |    animate={{ opacity: 1, scale: 1 }}
 198 | |    exit={{ opacity: 0, scale: 1.02 }}
 199 | |    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 200 | |    className="fixed inset-0 bg-transparent z-[9999] flex flex-col overflow-y-auto custom-scrollbar"
 201 | |    >
 202 | |    {/* Premium Full-Screen Header */}
 203 | |    <div className="sticky top-0 z-50 bg-transparent/80 backdrop-blur-xl border-b border-black/10 dark:border-white/20 px-6 lg:px-12 py-5 flex items-center justify-between">
 204 | |    <div className="flex items-center gap-4">
 205 | |    <button aria-label="Action button" type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white/80 dark:bg-themeElevated/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-sm text-themeText dark:text-themeText hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
 206 | |    <div>
 207 | |    <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-themeText tracking-tight">Edit Profile</h2>
 208 | |    {userRole === 'student' && (
 209 | |    <p className="text-[10px] font-bold text-amber-500 tracking-normal mt-0.5"><i className="fa-solid fa-shield-halved mr-1"></i> Requires Admin Approval</p>
 210 | |    )}
 211 | |    </div>
 212 | |    </div>
 213 | |    
 214 | |    {!hasPendingRequest && !isCropping && (
 215 | |    <button type="button" 
 216 | |    onClick={handleSubmit} 
 217 | |    disabled={isSubmitting || uploadingImage} 
 218 | |    className="px-6 py-2.5 rounded-full text-[14px] font-medium tracking-normal bg-themeAccent text-themeApp hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
 219 | |    >
 220 | |    {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check"></i> Save Changes</>}
 221 | |    </button>
 222 | |    )}
 223 | |    </div>
 224 | |   
 225 | |    {/* Main Content Area */}
 226 | |    <div className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-10">
 227 | |    
 228 | |    {hasPendingRequest ? (
 229 | |    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border-amber-500/30 ring-1 ring-amber-500/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
 230 | |    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
 231 | |    <i className="fa-solid fa-hourglass-half text-3xl text-amber-500"></i>
 232 | |    </div>
 233 | |    <h3 className="text-xl font-semibold tracking-tight text-themeText mb-2">Pending Request</h3>
 234 | |    <p className="text-sm font-medium text-themeTextSec max-w-md">Your profile update is currently under review by the administration. You will be notified once it is approved.</p>
 235 | |    </div>
 236 | |    ) : (
 237 | |    <>
 238 | |    {/* Avatar Section */}
 239 | |    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
 240 | |    <div className="absolute top-0 right-0 w-full max-w-[16rem] md:w-64 h-64 bg-themeAccent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
 241 | |    <h3 className="text-[14px] font-medium tracking-normal text-themeTextSec w-full text-left absolute top-6 left-8">Profile Picture</h3>
 242 | |    
 243 | |    <div className="relative group cursor-pointer mt-4" onClick={() => fileInputRef.current?.click()}>
 244 | |    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-themePanel border-theme border-themeBorderStrong border-4 border-themePanel ring-2 ring-themeBorder flex items-center justify-center overflow-hidden transition group-hover:ring-themeAccent">
 245 | |    {formData.profile_picture_url ? (
 246 | |    <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
 247 | |    ) : (
 248 | |    <i className="fa-solid fa-camera text-4xl text-themeTextSec"></i>
 249 | |    )}
 250 | |    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 251 | |    {uploadingImage ? (
 252 | |    <i className="fa-solid fa-circle-notch fa-spin text-themeText dark:text-white text-2xl"></i>
 253 | |    ) : (
 254 | |    <>
 255 | |    <i className="fa-solid fa-upload text-themeText dark:text-white mb-2 text-xl"></i>
 256 | |    <span className="text-[9px] font-black text-themeText dark:text-white tracking-normal">Update Photo</span>
 257 | |    </>
 258 | |    )}
 259 | |    </div>
 260 | |    </div>
 261 | |    <input 
 262 | |    type="file" 
 263 | |    accept="image/png, image/jpeg, image/webp" 
 264 | |    className="hidden" 
 265 | |    ref={fileInputRef} 
 266 | |    onChange={onSelectFile} 
 267 | |    disabled={uploadingImage || isCropping} 
 268 | |    />
 269 | |    </div>
 270 | |    <p className="text-[11px] font-bold text-themeTextSec text-center">JPEG, PNG or WebP under 2MB.</p>
 271 | |    </div>
 272 | |   
 273 | |    {/* Personal Details */}
 274 | |    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8">
 275 | |    <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-6 flex items-center gap-2">
 276 | |    <i className="fa-solid fa-id-card text-themeAccent"></i> Personal Details
 277 | |    </h3>
 278 | |    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 279 | |    <div className="flex flex-col gap-2">
 280 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Phone Number</label>
 281 | |    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="+91 9876543210" />
 282 | |    </div>
 283 | |    <div className="flex flex-col gap-2">
 284 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Blood Group</label>
 285 | |    <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition appearance-none font-medium">
 286 | |    <option value="">Select...</option>
 287 | |    <option>A+</option><option>A-</option>
 288 | |    <option>B+</option><option>B-</option>
 289 | |    <option>AB+</option><option>AB-</option>
 290 | |    <option>O+</option><option>O-</option>
 291 | |    </select>
 292 | |    </div>
 293 | |    <div className="flex flex-col gap-2">
 294 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Date of Birth</label>
 295 | |    <input min="2026-09-14" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" />
 296 | |    </div>
 297 | |    <div className="flex flex-col gap-2 md:col-span-2">
 298 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Current Address</label>
 299 | |    <input type="text" value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="Full residential address" />
 300 | |    </div>
 301 | |    </div>
 302 | |    </div>
 303 | |   
 304 | |    
 305 | |                           {/* Parent / Guardian Details */}
 306 | |                           <div className="bg-themePanel/50 rounded-3xl p-6 lg:p-8 border border-black/5 dark:border-white/5 space-y-6 mb-6">
 307 | |                               <h3 className="text-[15px] font-semibold text-themeText tracking-normal flex items-center gap-3">
 308 | |                                   <i className="fa-solid fa-users text-themeAccent"></i> Parent / Guardian Details
 309 | |                               </h3>
 310 | |                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 311 | |                                   <div className="space-y-2">
 312 | |                                       <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Name</label>
 313 | |                                       <input type="text" name="parent_name" value={formData.parent_name || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
 314 | |                                   </div>
 315 | |                                   <div className="space-y-2">
 316 | |                                       <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Phone</label>
 317 | |                                       <input type="text" name="parent_phone" value={formData.parent_phone || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
 318 | |                                   </div>
 319 | |                                   <div className="space-y-2 md:col-span-2">
 320 | |                                       <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Email (For Portal Login)</label>
 321 | |                                       <input type="email" name="parent_email" value={formData.parent_email || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
 322 | |                                   </div>
 323 | |                               </div>
 324 | |                           </div>
 325 | |   
 326 | |                           {/* Emergency Contact */}
 327 | |    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8">
 328 | |    <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-6 flex items-center gap-2">
 329 | |    <i className="fa-solid fa-heart-pulse text-rose-500"></i> Emergency Contact
 330 | |    </h3>
 331 | |    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 332 | |    <div className="flex flex-col gap-2 md:col-span-2">
 333 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Contact Name</label>
 334 | |    <input type="text" value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="Full Name" />
 335 | |    </div>
 336 | |    <div className="flex flex-col gap-2">
 337 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Relationship</label>
 338 | |    <input type="text" value={formData.emergencyRelation} onChange={e => setFormData({...formData, emergencyRelation: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="e.g. Father, Mother" />
 339 | |    </div>
 340 | |    <div className="flex flex-col gap-2">
 341 | |    <label className="text-[13px] font-medium text-themeTextSec ml-1">Emergency Phone</label>
 342 | |    <input type="tel" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="+91 9876543210" />
 343 | |    </div>
 344 | |    </div>
 345 | |    </div>
 346 | |    </>
 347 | |    )}
 348 | |    </div>
 349 | |   
 350 | |    {/* Cropping Modal Overlay */}
 351 | |    {isCropping && upImg && (
 352 | |    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
 353 | |    <div className="bg-themePanel border-theme border-themeBorderStrong p-6 rounded-3xl w-full max-w-2xl flex flex-col items-center border border-black/10 dark:border-white/20">
 354 | |    <h3 className="text-lg font-semibold tracking-tight text-themeText mb-6">Crop Profile Picture</h3>
 355 | |    
 356 | |    <div className="w-full max-h-[50vh] overflow-auto flex justify-center bg-gray-50 dark:bg-black/20 rounded-xl mb-6">
 357 | |    <ReactCrop
 358 | |    crop={crop}
 359 | |    onChange={(c) => setCrop(c)}
 360 | |    onComplete={(c) => setCompletedCrop(c)}
 361 | |    aspect={1}
 362 | |    circularCrop
 363 | |    className="max-h-[50vh]"
 364 | |    >
 365 | |    <img src={upImg} onLoad={(e) => onLoad(e.currentTarget)} alt="Upload Preview" className="max-h-[50vh] object-contain" />
 366 | |    </ReactCrop>
 367 | |    </div>
 368 | |    
 369 | |    <div className="flex gap-4 w-full justify-end">
 370 | |    <button type="button" 
 371 | |    onClick={() => { setIsCropping(false); setUpImg(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} 
 372 | |    className="px-6 py-2.5 rounded-full text-[14px] font-medium tracking-normal text-themeTextSec hover:bg-themePanel border-theme border-themeBorderStrong transition-colors"
 373 | |    >
 374 | |    Cancel
 375 | |    </button>
 376 | |    <SlideCommit
 377 | |                   label="Slide to Confirm"
 378 | |                   doneLabel="Done"
 379 | |                   errorLabel="Failed"
 380 | |                   onConfirm={uploadCroppedImage}
 381 | |                   trackColor="rgba(28, 28, 30, 0.05)"
 382 | |                   handleColor="#007AFF"
 383 | |                   successColor="#10b981"
 384 | |                   dangerColor="#f43f5e"
 385 | |                   width={200}
 386 | |                   height={48}
 387 | |                   radius={12}
 388 | |               />
 389 | |    </div>
 390 | |    </div>
 391 | |    </div>
 392 | |    )}
 393 | |    </motion.div>
 394 | |    </AnimatePresence>
 395 | |    );
 396 | `-> }
     `----

  ! eslint(no-unused-vars): Parameter 'error' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Shared/components/GlobalErrorBoundary.jsx:9:35]
  8 | 
  9 |   static getDerivedStateFromError(error) {
    :                                   ^^|^^
    :                                     `-- 'error' is declared here
 10 |     return { hasError: true };
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Identifier 'Send' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/CAREERS/PlacementCell.jsx:4:65]
 3 | import { motion } from 'framer-motion';
 4 | import { Briefcase, Building, CheckCircle, Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
   :                                                                 ^^|^
   :                                                                   `-- 'Send' is imported here
 5 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'generatedTicket' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/CAREERS/PlacementCell.jsx:20:12]
 19 |     const [errorMsg, setErrorMsg] = useState('');
 20 |     const [generatedTicket, setGeneratedTicket] = useState('');
    :            ^^^^^^^|^^^^^^^
    :                   `-- 'generatedTicket' is declared here
 21 | 
    `----
  help: Consider removing this declaration.

  x Invalid Unicode escape sequence
     ,-[Frontend/Shared/components/ReactBits/SwipeRow.jsx:105:43]
 104 |   const exposed = useTransform(x, v => s * v);
 105 |   const surfaceXf = useTransform(x, v => \`translateX(\${v}px)\`);
     :                                           ^
 106 |   const railXf = useTransform(exposed, e => \`translateX(\${-s * Math.max(0, D - e)}px)\`);
     `----

  x Invalid Unicode escape sequence
     ,-[Frontend/Shared/components/ReactBits/SwipeRow.jsx:105:56]
 104 |   const exposed = useTransform(x, v => s * v);
 105 |   const surfaceXf = useTransform(x, v => \`translateX(\${v}px)\`);
     :                                                        ^
 106 |   const railXf = useTransform(exposed, e => \`translateX(\${-s * Math.max(0, D - e)}px)\`);
     `----

  ! eslint(no-unused-vars): Catch parameter 'err' is caught but never used.
    ,-[Frontend/Website/components/NAVBAR/APPLY_NOW/ApplyNow.jsx:73:14]
 72 |       setIsSuccess(true);
 73 |     } catch (err) {
    :              ^|^
    :               `-- 'err' is declared here
 74 |       setErrorMsg("Failed to submit application. Please try again.");
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Variable 'location' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/Navbar.jsx:115:9]
 114 |   const { isAdmissionsOpen } = useSite();
 115 |   const location = useLocation();
     :         ^^^^|^^^
     :             `-- 'location' is declared here
 116 |   const [scrolled, setScrolled] = useState(false);
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'scrolled' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/Navbar.jsx:116:10]
 115 |   const location = useLocation();
 116 |   const [scrolled, setScrolled] = useState(false);
     :          ^^^^|^^^
     :              `-- 'scrolled' is declared here
 117 |   const [hidden, setHidden] = useState(false);
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'idx' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/Navbar.jsx:212:40]
 211 |               <div className="hidden lg:flex items-center h-full z-50">
 212 |                 {MENU_ITEMS.map((item, idx) => (
     :                                        ^|^
     :                                         `-- 'idx' is declared here
 213 |                   <div 
     `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Identifier 'ValorLogo' is imported but never used.
   ,-[Frontend/ERP/components/Login/Login.jsx:3:8]
 2 | import React, { useState, useEffect } from 'react';
 3 | import ValorLogo from '../shared/ValorLogo';
   :        ^^^^|^^^^
   :            `-- 'ValorLogo' is imported here
 4 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'motion' is imported but never used.
   ,-[Frontend/ERP/components/Login/Login.jsx:8:27]
 7 | import { Capacitor } from '@capacitor/core';
 8 | import { AnimatePresence, motion } from "framer-motion";
   :                           ^^^|^^
   :                              `-- 'motion' is imported here
 9 | import ForgotPasswordModal from './ForgotPasswordModal';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'userSession' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Student/Credentials/SecuritySettings.jsx:8:13]
 7 | export default function SecuritySettings() {
 8 |     const { userSession } = useERP();
   :             ^^^^^|^^^^^
   :                  `-- 'userSession' is declared here
 9 |     const [passwords, setPasswords] = useState({ new: "", confirm: "" });
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'sidebarMode' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx:7:67]
 6 | export default function AppearanceSettings() {
 7 |     const { activeTheme, changeTheme, navLayout, changeNavLayout, sidebarMode, changeSidebarMode } = useERP();
   :                                                                   ^^^^^|^^^^^
   :                                                                        `-- 'sidebarMode' is declared here
 8 | 
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'changeSidebarMode' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx:7:80]
 6 | export default function AppearanceSettings() {
 7 |     const { activeTheme, changeTheme, navLayout, changeNavLayout, sidebarMode, changeSidebarMode } = useERP();
   :                                                                                ^^^^^^^^|^^^^^^^^
   :                                                                                        `-- 'changeSidebarMode' is declared here
 8 | 
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'parentData' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Login/ParentLogin.jsx:13:12]
 12 |     const [error, setError] = useState('');
 13 |     const [parentData, setParentData] = useState(null);
    :            ^^^^^|^^^^
    :                 `-- 'parentData' is declared here
 14 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setParentData' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Login/ParentLogin.jsx:13:24]
 12 |     const [error, setError] = useState('');
 13 |     const [parentData, setParentData] = useState(null);
    :                        ^^^^^^|^^^^^^
    :                              `-- 'setParentData' is declared here
 14 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Catch parameter 'err' is caught but never used.
    ,-[Frontend/ERP/components/Login/ParentLogin.jsx:31:18]
 30 |             setStep('otp');
 31 |         } catch (err) {
    :                  ^|^
    :                   `-- 'err' is declared here
 32 |             setError("Failed to send OTP. Please try again.");
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Identifier 'Preloader' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/PROGRAMS/Programs.jsx:1:8]
 1 | import Preloader from '../../UI/Preloader/Preloader';
   :        ^^^^|^^^^
   :            `-- 'Preloader' is imported here
 2 | /* © 2026 JSM VALOR. All Rights Reserved. */
   `----
  help: Consider removing this import.

  ! react-hooks(exhaustive-deps): React Hook useEffect has an unnecessary dependency: window.
    ,-[Frontend/Website/components/NAVBAR/PROGRAMS/Programs.jsx:37:7]
 36 |     }
 37 |   }, [window.location.hash]);
    :       ^^^^^^^^^^^^^^^^^^^^
 38 | 
    `----
  help: Consider removing it from the dependency array. Outer scope values aren't valid dependencies because mutating them doesn't re-render the component.

  ! eslint(no-unused-vars): Identifier 'useEffect' is imported but never used.
   ,-[Frontend/ERP/components/shared/NotificationsCenter/NotificationsCenter.jsx:2:27]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
 2 | import React, { useState, useEffect } from 'react';
   :                           ^^^^|^^^^
   :                               `-- 'useEffect' is imported here
 3 | import { motion, AnimatePresence } from 'framer-motion';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'formatDistanceToNow' is imported but never used.
   ,-[Frontend/ERP/components/shared/NotificationsCenter/NotificationsCenter.jsx:6:10]
 5 | import { useERP } from '../../../context/ErpContext';
 6 | import { formatDistanceToNow, format } from 'date-fns';
   :          ^^^^^^^^^|^^^^^^^^^
   :                   `-- 'formatDistanceToNow' is imported here
 7 | import PageHeader from '../PageHeader/PageHeader';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'userSession' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/NotificationsCenter/NotificationsCenter.jsx:10:13]
  9 | export default function NotificationsCenter({ setActiveTab }) {
 10 |     const { userSession, unreadNotifications, setUnreadNotifications, universalNotifications = [], setUniversalNotifications } = useERP();
    :             ^^^^^|^^^^^
    :                  `-- 'userSession' is declared here
 11 |     const [activeFilter, setActiveFilter] = useState('All'); // All, Unread, Read
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'useAnimation' is imported but never used.
   ,-[Frontend/Shared/components/ReactBits/HoldButton/HoldButton.jsx:2:18]
 1 | import { useEffect, useState } from 'react';
 2 | import { motion, useAnimation, useAnimationControls } from 'framer-motion';
   :                  ^^^^^^|^^^^^
   :                        `-- 'useAnimation' is imported here
 3 | 
   `----
  help: Consider removing this import.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fire'
     ,-[Frontend/Shared/components/ReactBits/HoldButton/HoldButton.jsx:101:6]
  97 |     if (phase === 'holding') {
  98 |       const t = setTimeout(fire, holdTime);
     :                            ^^|^
     :                              `-- useEffect uses `fire` here
  99 |       return () => clearTimeout(t);
 100 |     }
 101 |   }, [phase, holdTime]);
     :      ^^^^^^^^^^^^^^^^^
 102 | 
     `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchTodayRecord'
    ,-[Frontend/ERP/components/shared/DashboardWidgets/FacultyWebClock.jsx:21:8]
 19 |     useEffect(() => {
 20 |         fetchTodayRecord();
    :         ^^^^^^^^|^^^^^^^
    :                 `-- useEffect uses `fetchTodayRecord` here
 21 |     }, [userSession]);
    :        ^^^^^^^^^^^^^
 22 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'generateCalendarICS' is imported but never used.
   ,-[Frontend/ERP/components/Student/Timetable/Timetable.jsx:5:10]
 4 | import { useERP } from "../../../context/ErpContext";
 5 | import { generateCalendarICS } from "../../../lib/calendarGenerator";
   :          ^^^^^^^^^|^^^^^^^^^
   :                   `-- 'generateCalendarICS' is imported here
 6 | import WeeklyChart from "../../shared/WeeklyChart";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'WeeklyChart' is imported but never used.
   ,-[Frontend/ERP/components/Student/Timetable/Timetable.jsx:6:8]
 5 | import { generateCalendarICS } from "../../../lib/calendarGenerator";
 6 | import WeeklyChart from "../../shared/WeeklyChart";
   :        ^^^^^|^^^^^
   :             `-- 'WeeklyChart' is imported here
 7 | import WeeklyList from "../../shared/WeeklyList";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Parameter 'isEmbedded' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Student/Timetable/Timetable.jsx:343:30]
 342 | 
 343 |  const LectureSideSheet = ({ isEmbedded = false }) => {
     :                              ^^^^^|^^^^
     :                                   `-- 'isEmbedded' is declared here
 344 |  if (!selectedLecture) return null;
     `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchSchedule'
     ,-[Frontend/ERP/components/Student/Timetable/Timetable.jsx:106:5]
 104 |  useEffect(() => {
 105 |  fetchSchedule();
     :  ^^^^^^|^^^^^^
     :        `-- useEffect uses `fetchSchedule` here
 106 |  }, [userSession?.batch_id]);
     :     ^^^^^^^^^^^^^^^^^^^^^^^
 107 | 
     `----
  help: Either include it or remove the dependency array.

  x Unexpected token
     ,-[Frontend/ERP/components/Student/Leave/Leave.jsx:245:121]
 244 | 
 245 |  } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); });
     :                                                                                                                         ^
 246 |  } finally {
     `----

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
    ,-[Frontend/ERP/components/shared/IntelligentBot.jsx:80:18]
 79 |             return "There are no recent notices published.";
 80 |         } catch (e) {
    :                  |
    :                  `-- 'e' is declared here
 81 |             return "I couldn't retrieve the notices at this moment.";
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
    ,-[Frontend/ERP/components/shared/IntelligentBot.jsx:92:18]
 91 |             return "You have no active assignments right now.";
 92 |         } catch (e) {
    :                  |
    :                  `-- 'e' is declared here
 93 |             return "I couldn't retrieve assignments at this moment.";
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Variable 'error' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/CONTACT/Contact.jsx:48:21]
 47 |     try {
 48 |             const { error } = await supabase.from('contact_inquiries').insert([{
    :                     ^^|^^
    :                       `-- 'error' is declared here
 49 |         name: formData.name, email: formData.email, phone: formData.phone,
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Catch parameter 'err' is caught but never used.
    ,-[Frontend/Website/components/NAVBAR/CONTACT/Contact.jsx:71:14]
 70 |       setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
 71 |     } catch (err) {
    :              ^|^
    :               `-- 'err' is declared here
 72 |       setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    `----
  help: Consider handling this error.

  x Unexpected token
     ,-[Frontend/ERP/components/Student/Helpdesk/Helpdesk.jsx:102:128]
 101 | 
 102 |         } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); });
     :                                                                                                                                ^
 103 |         } finally {
     `----

  ! eslint(no-unused-vars): Variable 'isDrag' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Shared/components/ReactBits/SlideCommit/SlideCommit.jsx:18:10]
 17 |   const [phase, setPhase] = useState('idle');
 18 |   const [isDrag, setIsDrag] = useState(false);
    :          ^^^|^^
    :             `-- 'isDrag' is declared here
 19 |   const containerRef = useRef(null);
    `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'snapTo'
    ,-[Frontend/Shared/components/ReactBits/SlideCommit/SlideCommit.jsx:93:6]
 88 |         setPhase('idle');
 89 |         snapTo(0);
    :         ^^^|^^
    :            `-- useEffect uses `snapTo` here
 90 |       }, 2000);
 91 |       return () => clearTimeout(t);
 92 |     }
 93 |   }, [phase]);
    :      ^^^^^^^
 94 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'attendanceData' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/DashboardWidgets/DashboardWorkSchedule.jsx:11:12]
 10 |     const [timetable, setTimetable] = useState([]);
 11 |     const [attendanceData, setAttendanceData] = useState({}); // mapped by class_id or subject
    :            ^^^^^^^|^^^^^^
    :                   `-- 'attendanceData' is declared here
 12 |     const [loading, setLoading] = useState(true);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'Preloader' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/PROGRAMS/CourseBBALLB.jsx:1:8]
 1 | import Preloader from '../../UI/Preloader/Preloader';
   :        ^^^^|^^^^
   :            `-- 'Preloader' is imported here
 2 | /* © 2026 JSM VALOR. All Rights Reserved. */
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'error' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx:53:27]
 52 |             setLoading(true);
 53 |             const { data, error } = await supabase
    :                           ^^|^^
    :                             `-- 'error' is declared here
 54 |                 .from('profiles')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'lastName' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx:114:9]
 113 |   const nameParts = faculty.name.split(' ');
 114 |   const lastName = nameParts.length > 1 ? nameParts.pop() : '';
     :         ^^^^|^^^
     :             `-- 'lastName' is declared here
 115 |   const firstNames = nameParts.join(' ');
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'firstNames' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx:115:9]
 114 |   const lastName = nameParts.length > 1 ? nameParts.pop() : '';
 115 |   const firstNames = nameParts.join(' ');
     :         ^^^^^|^^^^
     :              `-- 'firstNames' is declared here
 116 | 
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'index' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx:281:42]
 280 |           >
 281 |             {availableTabs.map((section, index) => {
     :                                          ^^|^^
     :                                            `-- 'index' is declared here
 282 |               const content = faculty[section.id];
     `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Identifier 'User' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogDetail.jsx:6:21]
 5 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 6 | import { ArrowLeft, User, Calendar, Tag, Briefcase } from 'lucide-react';
   :                     ^^|^
   :                       `-- 'User' is imported here
 7 | import ReactMarkdown from 'react-markdown';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Tag' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogDetail.jsx:6:37]
 5 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 6 | import { ArrowLeft, User, Calendar, Tag, Briefcase } from 'lucide-react';
   :                                     ^|^
   :                                      `-- 'Tag' is imported here
 7 | import ReactMarkdown from 'react-markdown';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Briefcase' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogDetail.jsx:6:42]
 5 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 6 | import { ArrowLeft, User, Calendar, Tag, Briefcase } from 'lucide-react';
   :                                          ^^^^|^^^^
   :                                              `-- 'Briefcase' is imported here
 7 | import ReactMarkdown from 'react-markdown';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'error' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogDetail.jsx:20:21]
 19 |       
 20 |       const { data, error } = await supabase.from('admin_notices').select('*').eq('id', id).eq('is_public', true).single();
    :                     ^^|^^
    :                       `-- 'error' is declared here
 21 |       
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'Preloader' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/PROGRAMS/CourseBALLB.jsx:1:8]
 1 | import Preloader from '../../UI/Preloader/Preloader';
   :        ^^^^|^^^^
   :            `-- 'Preloader' is imported here
 2 | /* © 2026 JSM VALOR. All Rights Reserved. */
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'motion' is imported but never used.
   ,-[Frontend/ERP/components/Student/StudentSupportHub/StudentSupportHub.jsx:2:10]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import { motion } from 'framer-motion';
   :          ^^^|^^
   :             `-- 'motion' is imported here
 3 | import React, { useState } from "react";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'AnimatePresence' is imported but never used.
   ,-[Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx:3:18]
 2 | import React, { useState, useEffect } from 'react';
 3 | import { motion, AnimatePresence } from 'framer-motion';
   :                  ^^^^^^^|^^^^^^^
   :                         `-- 'AnimatePresence' is imported here
 4 | import BirthdayWidget from '../BirthdayWidget';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Calendar' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/EVENTS/EventsPage.jsx:8:17]
 7 | import { ScrollTrigger } from 'gsap/ScrollTrigger';
 8 | import { Clock, Calendar, ArrowRight } from 'lucide-react';
   :                 ^^^^|^^^
   :                     `-- 'Calendar' is imported here
 9 | import fallbackLogo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';
   `----
  help: Consider removing this import.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchAll'
    ,-[Frontend/ERP/components/Student/StudentProgressCard/StudentProgressCard.jsx:35:8]
 33 |         if (!userSession?.db_id) return;
 34 |         fetchAll();
    :         ^^^^|^^^
    :             `-- useEffect uses `fetchAll` here
 35 |     }, [userSession]);
    :        ^^^^^^^^^^^^^
 36 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Parameter 'idx' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/shared/WeeklyChart.jsx:54:46]
 53 |                     </div>
 54 |                     {displaySlots.map((slot, idx) => (
    :                                              ^|^
    :                                               `-- 'idx' is declared here
 55 |                         <div key={slot.id} className={`${slot.type === 'break' ? 'w-16 bg-black/5 dark:bg-white/5' : 'flex-1'} shrink-0 text-center py-3 px-2 border-r border-black/10 dark:border-white/10 last:border-r-0 flex flex-col justify-center items-center`}>
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'rowIdx' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/shared/WeeklyChart.jsx:70:44]
 69 |                 <div className="flex flex-col relative z-10">
 70 |                     {displayDays.map((day, rowIdx) => {
    :                                            ^^^|^^
    :                                               `-- 'rowIdx' is declared here
 71 |                         const isToday = day === currentDay;
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'colIdx' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/shared/WeeklyChart.jsx:82:58]
 81 |                                 {/* Time Slots for the Day */}
 82 |                                 {displaySlots.map((slot, colIdx) => {
    :                                                          ^^^|^^
    :                                                             `-- 'colIdx' is declared here
 83 |                                     if (slot.type === 'break') {
    `----
  help: Consider removing this parameter.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   ,-[Frontend/ERP/components/Student/sidebar/Sidebar.jsx:5:14]
 4 | 
 5 | export const STUDENT_NAV_MEGA = [
   :              ^^^^^^^^^^^^^^^^
 6 |   {
   `----

  ! eslint(no-unused-vars): Variable 'error' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/EVENTS/EventDetail.jsx:29:21]
 28 | 
 29 |       const { data, error } = await query.single();
    :                     ^^|^^
    :                       `-- 'error' is declared here
 30 |       
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'Preloader' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/PROGRAMS/CourseLLB.jsx:1:8]
 1 | import Preloader from '../../UI/Preloader/Preloader';
   :        ^^^^|^^^^
   :            `-- 'Preloader' is imported here
 2 | /* © 2026 JSM VALOR. All Rights Reserved. */
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'error' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx:19:27]
 18 |         try {
 19 |             const { data, error } = await supabase
    :                           ^^|^^
    :                             `-- 'error' is declared here
 20 |                 .from('system_settings')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'idx' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx:128:41]
 127 |                     <tbody>
 128 |                         {rows.map((row, idx) => (
     :                                         ^|^
     :                                          `-- 'idx' is declared here
 129 |                             <tr key={row.id} className="border-b border-black/[0.04] dark:border-white/[0.08] last:border-none hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
     `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Variable 'setActiveCategory' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogsPage.jsx:17:28]
 16 |     const [loading, setLoading] = useState(true);
 17 |     const [activeCategory, setActiveCategory] = useState('All');
    :                            ^^^^^^^^|^^^^^^^^
    :                                    `-- 'setActiveCategory' is declared here
 18 |     const containerRef = useRef(null);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'categories' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/BLOGS/BlogsPage.jsx:63:11]
 62 | 
 63 |     const categories = useMemo(() => {
    :           ^^^^^|^^^^
    :                `-- 'categories' is declared here
 64 |         const unique = new Set(blogs.map((b) => b.category || 'Announcement'));
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'renderEventsTab' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Admin/notices/AdminNotices.jsx:262:8]
 261 | 
 262 |  const renderEventsTab = () => (
     :        ^^^^^^^|^^^^^^^
     :               `-- 'renderEventsTab' is declared here
 263 |  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'ArrowUpRight' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/CAMPUS/MOOT_COURT/MootCourt.jsx:7:10]
 6 | import { ScrollTrigger } from 'gsap/ScrollTrigger';
 7 | import { ArrowUpRight } from 'lucide-react';
   :          ^^^^^^|^^^^^
   :                `-- 'ArrowUpRight' is imported here
 8 | import * as Icons from 'lucide-react';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'isChecking' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/SystemUpdater.jsx:11:12]
 10 |     const [updateInfo, setUpdateInfo] = useState(null);
 11 |     const [isChecking, setIsChecking] = useState(true);
    :            ^^^^^|^^^^
    :                 `-- 'isChecking' is declared here
 12 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'ArrowRight' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/CAREERS/Careers.jsx:4:10]
 3 | import { motion, AnimatePresence } from 'framer-motion';
 4 | import { ArrowRight, CheckCircle2, Briefcase, MapPin, X, Send, AlertCircle, Link2, Ticket } from 'lucide-react';
   :          ^^^^^|^^^^
   :               `-- 'ArrowRight' is imported here
 5 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'dpdpaConsent' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/CAREERS/Careers.jsx:19:10]
 18 |   const [isSubmitting, setIsSubmitting] = useState(false);
 19 |   const [dpdpaConsent, setDpdpaConsent] = useState(false);
    :          ^^^^^^|^^^^^
    :                `-- 'dpdpaConsent' is declared here
 20 |   const [isSuccess, setIsSuccess] = useState(false);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setDpdpaConsent' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/CAREERS/Careers.jsx:19:24]
 18 |   const [isSubmitting, setIsSubmitting] = useState(false);
 19 |   const [dpdpaConsent, setDpdpaConsent] = useState(false);
    :                        ^^^^^^^|^^^^^^^
    :                               `-- 'setDpdpaConsent' is declared here
 20 |   const [isSuccess, setIsSuccess] = useState(false);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'appError' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/CAREERS/Careers.jsx:66:22]
 65 |       // 1. Insert into career_applications
 66 |       const { error: appError } = await supabase.from('career_applications').insert([{
    :                      ^^^^|^^^
    :                          `-- 'appError' is declared here
 67 |         job_id: selectedJob.id,
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'useMemo' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/ABOUT/Faculty.jsx:2:27]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import React, { useState, useMemo, useEffect, useRef } from 'react';
   :                           ^^^|^^^
   :                              `-- 'useMemo' is imported here
 3 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unreachable): Unreachable code.
    ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:72:9]
 71 |             
 72 | ,->         return config.map(group => {
 73 | |               const filteredLinks = group.links.filter(link => {
 74 | |                   const matchLabel = link.label.toLowerCase().includes(q);
 75 | |                   const matchChildren = link.children && link.children.some(child => child.label.toLowerCase().includes(q));
 76 | |                   return matchLabel || matchChildren;
 77 | |               });
 78 | |               return { ...group, links: filteredLinks };
 79 | `->         }).filter(group => group.links.length > 0);
 80 |         }, [config]);
    `----
  help: Remove the unreachable code or fix the control flow to make it reachable.

  ! eslint(no-unused-vars): Identifier 'createPortal' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:3:10]
 2 | import { motion, AnimatePresence } from "framer-motion";
 3 | import { createPortal } from "react-dom";
   :          ^^^^^^|^^^^^
   :                `-- 'createPortal' is imported here
 4 | import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'useRef' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:4:38]
 3 | import { createPortal } from "react-dom";
 4 | import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
   :                                      ^^^|^^
   :                                         `-- 'useRef' is imported here
 5 | import { useERP } from '../../../context/ErpContext';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'useCallback' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:4:46]
 3 | import { createPortal } from "react-dom";
 4 | import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
   :                                              ^^^^^|^^^^^
   :                                                   `-- 'useCallback' is imported here
 5 | import { useERP } from '../../../context/ErpContext';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Dialog' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:6:10]
 5 | import { useERP } from '../../../context/ErpContext';
 6 | import { Dialog } from '../../../utils/DialogManager';
   :          ^^^|^^
   :             `-- 'Dialog' is imported here
 7 | import pclLogo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'SIDEBAR_MAX_WIDTH' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:12:7]
 11 | const SIDEBAR_DEFAULT_WIDTH = 280; // Default expanded width
 12 | const SIDEBAR_MAX_WIDTH = 400; // Maximum drag width
    :       ^^^^^^^^|^^^^^^^^
    :               `-- 'SIDEBAR_MAX_WIDTH' is declared here
 13 | const STORAGE_KEY_WIDTH = 'jsmerp_sidebar_width';
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'STORAGE_KEY_WIDTH' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:13:7]
 12 | const SIDEBAR_MAX_WIDTH = 400; // Maximum drag width
 13 | const STORAGE_KEY_WIDTH = 'jsmerp_sidebar_width';
    :       ^^^^^^^^|^^^^^^^^
    :               `-- 'STORAGE_KEY_WIDTH' is declared here
 14 | const STORAGE_KEY_FAVS = 'jsmerp_sidebar_favs';
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'handleLogout' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx:32:11]
 31 |     
 32 |     const handleLogout = async () => {
    :           ^^^^^^|^^^^^
    :                 `-- 'handleLogout' is declared here
 33 |         if (window.triggerManualLogout) {
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'useEffect' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:2:17]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import React, { useEffect, useState } from 'react';
   :                 ^^^^|^^^^
   :                     `-- 'useEffect' is imported here
 3 | import { motion, AnimatePresence } from 'framer-motion';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'AnimatePresence' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:3:18]
 2 | import React, { useEffect, useState } from 'react';
 3 | import { motion, AnimatePresence } from 'framer-motion';
   :                  ^^^^^^^|^^^^^^^
   :                         `-- 'AnimatePresence' is imported here
 4 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'supabase' is imported but never used.
   ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:4:10]
 3 | import { motion, AnimatePresence } from 'framer-motion';
 4 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   :          ^^^^|^^^
   :              `-- 'supabase' is imported here
 5 | import { useERP } from '../../../context/ErpContext';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'userSession' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:9:13]
  8 | export default function NotificationsDropdown({ onClose, setActiveTab }) {
  9 |     const { userSession, universalNotifications = [] } = useERP();
    :             ^^^^^|^^^^^
    :                  `-- 'userSession' is declared here
 10 |     const [isLoading, setIsLoading] = useState(false);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setIsLoading' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:10:23]
  9 |     const { userSession, universalNotifications = [] } = useERP();
 10 |     const [isLoading, setIsLoading] = useState(false);
    :                       ^^^^^^|^^^^^
    :                             `-- 'setIsLoading' is declared here
 11 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-expressions): Expected expression to be used
    ,-[Frontend/ERP/components/shared/Navigation/NotificationsDropdown.jsx:55:41]
 54 |                                     onClick={() => {
 55 |                                         n.action_link ? setActiveTab(n.action_link) : setActiveTab('dashboard');
    :                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 56 |                                         window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    `----
  help: Consider using this expression or removing it

  ! eslint(no-unused-vars): Identifier 'AnimatePresence' is imported but never used.
   ,-[Frontend/ERP/components/Admin/WhatsAppAdmin/WhatsAppAdmin.jsx:3:18]
 2 | import React, { useState, useEffect } from 'react';
 3 | import { motion, AnimatePresence } from 'framer-motion';
   :                  ^^^^^^^|^^^^^^^
   :                         `-- 'AnimatePresence' is imported here
 4 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'alert' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Admin/AdminAcademicHub/AdminSystemSettings.jsx:7:10]
 6 | export default function AdminSystemSettings({}) {
 7 |  const { alert } = useERP();
   :          ^^|^^
   :            `-- 'alert' is declared here
 8 |  const [settings, setSettings] = useState({
   `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminAcademicHub/AdminSystemSettings.jsx:6:45]
 5 | 
 6 | export default function AdminSystemSettings({}) {
   :                                             ^^
 7 |  const { alert } = useERP();
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Identifier 'motion' is imported but never used.
   ,-[Frontend/ERP/components/Student/StudentAcademicHub/StudentAcademicHub.jsx:2:10]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import { motion } from 'framer-motion';
   :          ^^^|^^
   :             `-- 'motion' is imported here
 3 | import React, { useState } from "react";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'theme' is imported but never used.
   ,-[Frontend/ERP/components/Student/StudentAcademicHub/StudentAcademicHub.jsx:4:10]
 3 | import React, { useState } from "react";
 4 | import { theme } from '../../../../Shared/theme';
   :          ^^|^^
   :            `-- 'theme' is imported here
 5 | import CourseVault from "../CourseVault/CourseVault";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Parameter 'isEmbedded' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/Student/StudentAcademicHub/StudentAcademicHub.jsx:11:46]
 10 | 
 11 | export default function StudentAcademicHub({ isEmbedded = false, }) {
    :                                              ^^^^^|^^^^
    :                                                   `-- 'isEmbedded' is declared here
 12 |     const [activeTab, setActiveTab] = useState("vault");
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Variable 'globalSchedule' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:16:16]
 15 |  // 1. Fetch Global Schedule (Timings & Off Days)
 16 |  const { data: globalSchedule, error: globalErr } = await supabase
    :                ^^^^^^^|^^^^^^
    :                       `-- 'globalSchedule' is declared here
 17 |  .from('institution_schedule')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'dayNames' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:27:8]
 26 |  // Official PCL Timings
 27 |  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    :        ^^^^|^^^
    :            `-- 'dayNames' is declared here
 28 |  const workingDaysIndex = [1, 2, 3, 4, 5, 6]; // 1-Mon, 6-Sat. (Sunday is off)
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'monFriSlots' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:32:8]
 31 |  // Mon-Fri: 8:45 AM - 4:45 PM
 32 |  const monFriSlots = [
    :        ^^^^^|^^^^^
    :             `-- 'monFriSlots' is declared here
 33 |     { s: '08:45:00', e: '09:45:00' },
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'saturdaySlots' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:44:8]
 43 |  // Saturday: 9:30 AM - 1:00 PM
 44 |  const saturdaySlots = [
    :        ^^^^^^|^^^^^^
    :              `-- 'saturdaySlots' is declared here
 45 |     { s: '09:30:00', e: '10:30:00' },
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'batchName' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:84:8]
 83 |  for (const batch of batches) {
 84 |  const batchName = batch.name;
    :        ^^^^|^^^^
    :            `-- 'batchName' is declared here
 85 |  const batchSchedule = {}; // day -> time -> bool
    `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx:6:39]
 5 | 
 6 | export default function AutoGenerator({}) {
   :                                       ^^
 7 |  const [isGenerating, setIsGenerating] = useState(false);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Identifier 'ArrowRight' is imported but never used.
   ,-[Frontend/Website/components/NAVBAR/CAMPUS/FACILITIES/Facilities.jsx:5:10]
 4 | import { Link } from 'react-router-dom';
 5 | import { ArrowRight } from 'lucide-react';
   :          ^^^^^|^^^^
   :               `-- 'ArrowRight' is imported here
 6 | import * as Icons from 'lucide-react';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'AnimatePresence' is imported but never used.
   ,-[Frontend/ERP/components/shared/BirthdayWidget.jsx:5:18]
 4 | import { useERP } from "../../context/ErpContext";
 5 | import { motion, AnimatePresence } from 'framer-motion';
   :                  ^^^^^^^|^^^^^^^
   :                         `-- 'AnimatePresence' is imported here
 6 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'mmdd' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/BirthdayWidget.jsx:23:23]
 22 |                 const day = String(today.getDate()).padStart(2, '0');
 23 |                 const mmdd = `${month}-${day}`;
    :                       ^^|^
    :                         `-- 'mmdd' is declared here
 24 | 
    `----
  help: Consider removing this declaration.

  x Unexpected token
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AdminCourseBuilder.jsx:39:117]
 38 |  });
 39 |  } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
    :                                                                                                                     ^
 40 |  }
    `----

  ! eslint(no-empty-pattern): Empty object binding pattern
    ,-[Frontend/ERP/components/Admin/AdminAcademicHub/AdminBatchManager.jsx:9:43]
  8 | 
  9 | export default function AdminBatchManager({}) {
    :                                           ^^
 10 |  const [batches, setBatches] = useState([]);
    `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  x Unexpected token
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/AdminTimetableHQ.jsx:35:117]
 34 |  });
 35 |  } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
    :                                                                                                                     ^
 36 |  }
    `----

  x Expected a semicolon or an implicit semicolon after a statement, but found none
     ,-[Frontend/ERP/components/Admin/BlogManager/BlogManager.jsx:135:125]
 134 |  fetchBlogs();
 135 |  } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } the post.`);
     :                                                                                                                             ^
 136 |  setIsEditing(false);
     `----
  help: Try inserting a semicolon here

  ! eslint(no-unused-vars): Identifier 'Sentry' is imported but never used.
   ,-[Frontend/ERP/components/shared/TopNav.jsx:3:13]
 2 | import React, { useState, useRef } from 'react';
 3 | import * as Sentry from '@sentry/react';
   :             ^^^|^^
   :                `-- 'Sentry' is imported here
 4 | import { STUDENT_NAV_MEGA as STUDENT_SIDEBAR_CONFIG } from '../Student/sidebar/Sidebar';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'downloadUserData' is imported but never used.
    ,-[Frontend/ERP/components/shared/TopNav.jsx:12:10]
 11 | import NotificationsDropdown from './Navigation/NotificationsDropdown';
 12 | import { downloadUserData } from '../../../Shared/utils/DataExport';
    :          ^^^^^^^^|^^^^^^^
    :                  `-- 'downloadUserData' is imported here
 13 | import { motion, AnimatePresence } from 'framer-motion';
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'changeNavLayout' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/TopNav.jsx:16:13]
 15 | export default function TopNav({ userSession, activeTab, setActiveTab, onLogout }) {
 16 |     const { changeNavLayout, notices, activeTheme, unreadNotifications } = useERP();
    :             ^^^^^^^|^^^^^^^
    :                    `-- 'changeNavLayout' is declared here
 17 |     const { addFlag } = useNotification();
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'addFlag' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/TopNav.jsx:17:13]
 16 |     const { changeNavLayout, notices, activeTheme, unreadNotifications } = useERP();
 17 |     const { addFlag } = useNotification();
    :             ^^^|^^^
    :                `-- 'addFlag' is declared here
 18 |     const [activeDropdown, setActiveDropdown] = useState(null);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'GraduationCap' is imported but never used.
   ,-[Frontend/Website/components/HOME/HERO/Hero.jsx:4:22]
 3 | import { Link } from 'react-router-dom';
 4 | import { ArrowRight, GraduationCap, FileText, Landmark } from 'lucide-react';
   :                      ^^^^^^|^^^^^^
   :                            `-- 'GraduationCap' is imported here
 5 | import { motion } from 'framer-motion';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'FileText' is imported but never used.
   ,-[Frontend/Website/components/HOME/HERO/Hero.jsx:4:37]
 3 | import { Link } from 'react-router-dom';
 4 | import { ArrowRight, GraduationCap, FileText, Landmark } from 'lucide-react';
   :                                     ^^^^|^^^
   :                                         `-- 'FileText' is imported here
 5 | import { motion } from 'framer-motion';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Landmark' is imported but never used.
   ,-[Frontend/Website/components/HOME/HERO/Hero.jsx:4:47]
 3 | import { Link } from 'react-router-dom';
 4 | import { ArrowRight, GraduationCap, FileText, Landmark } from 'lucide-react';
   :                                               ^^^^|^^^
   :                                                   `-- 'Landmark' is imported here
 5 | import { motion } from 'framer-motion';
   `----
  help: Consider removing this import.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:5:39]
 4 | 
 5 | export default function LeaveCalendar({}) {
   :                                       ^^
 6 |  const [currentMonth, setCurrentMonth] = useState(new Date());
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchLeavesForMonth'
    ,-[Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:12:5]
 10 |  useEffect(() => {
 11 |  fetchLeavesForMonth();
    :  ^^^^^^^^^|^^^^^^^^^
    :           `-- useEffect uses `fetchLeavesForMonth` here
 12 |  }, [currentMonth]);
    :     ^^^^^^^^^^^^^^
 13 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-constant-binary-expression): Unexpected constant truthiness on the left-hand side of a "||" expression
    ,-[Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:76:3]
 75 |  <div key={leave.id} className={`text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded truncate bg-${leave.leave_type || 'blue'}-500/10 text-${leave.leave_type || 'blue'}-500 hover:bg-${leave.leave_type || 'blue'}-500 hover:text-themeText dark:text-white transition-colors cursor-default`}>
 76 |  {'Faculty' || 'Faculty'}
    :   ^^^^^^^^^^^^^^^^^^^^^^
 77 |  </div>
    `----
  help: This expression always evaluates to the constant on the left-hand side

  ! oxc(const-comparisons): Both sides of the logical operator are the same
    ,-[Frontend/ERP/components/Admin/LeaveManagement/LeaveCalendar.jsx:76:3]
 75 |  <div key={leave.id} className={`text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded truncate bg-${leave.leave_type || 'blue'}-500/10 text-${leave.leave_type || 'blue'}-500 hover:bg-${leave.leave_type || 'blue'}-500 hover:text-themeText dark:text-white transition-colors cursor-default`}>
 76 |  {'Faculty' || 'Faculty'}
    :   ^^^^|^^^^    ^^^^|^^^^
    :       |            `-- This expression will always evaluate to true
    :       `-- If this expression evaluates to true
 77 |  </div>
    `----
  help: This logical expression will always evaluate to the same value as the expression itself.

  ! eslint(no-unused-vars): Parameter 'getPresenceStatus' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/shared/DirectorySidebarWidget/DirectorySidebarWidget.jsx:160:67]
 159 | 
 160 | function FullDirectoryModal({ onClose, allUsers, role, menteeIds, getPresenceStatus }) {
     :                                                                   ^^^^^^^^|^^^^^^^^
     :                                                                           `-- 'getPresenceStatus' is declared here
 161 |     const [searchQuery, setSearchQuery] = useState('');
     `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchDirectoryData'
    ,-[Frontend/ERP/components/shared/DirectorySidebarWidget/DirectorySidebarWidget.jsx:19:8]
 17 |     useEffect(() => {
 18 |         fetchDirectoryData();
    :         ^^^^^^^^^|^^^^^^^^
    :                  `-- useEffect uses `fetchDirectoryData` here
 19 |     }, [role]);
    :        ^^^^^^
 20 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useMemo has a missing dependency: 'menteeIds'
     ,-[Frontend/ERP/components/shared/DirectorySidebarWidget/DirectorySidebarWidget.jsx:218:8]
 199 |             groups['Fellow Faculty'] = filtered.filter(u => u.role === 'faculty');
 200 |             groups['My Mentees'] = filtered.filter(u => u.role === 'student' && menteeIds.includes(u.id));
     :                                                                                 ^^^^|^^^^
     :                                                                                     `-- useMemo uses `menteeIds` here
 201 |             groups['Other Students'] = filtered.filter(u => u.role === 'student' && !menteeIds.includes(u.id));
 202 |         } else {
 203 |             // Admin View
 204 |             groups['Key Management'] = filtered.filter(u => u.role === 'admin');
 205 |             groups['Faculty'] = filtered.filter(u => u.role === 'faculty');
 206 |             
 207 |             // Sub-categorize students by batch in Admin view!
 208 |             const allStudents = filtered.filter(u => u.role === 'student');
 209 |             allStudents.forEach(s => {
 210 |                 const batch = s.batch_name || 'Unassigned Students';
 211 |                 if (!groups[batch]) groups[batch] = [];
 212 |                 groups[batch].push(s);
 213 |             });
 214 |         }
 215 |         
 216 |         // Filter out empty groups
 217 |         return Object.fromEntries(Object.entries(groups).filter(([_, arr]) => arr.length > 0));
 218 |     }, [allUsers, role, searchQuery]);
     :        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 219 | 
     `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchReplacements'
    ,-[Frontend/ERP/components/Admin/LeaveManagement/ReplacementEngine.jsx:12:5]
 10 |  useEffect(() => {
 11 |  fetchReplacements();
    :  ^^^^^^^^|^^^^^^^^
    :          `-- useEffect uses `fetchReplacements` here
 12 |  }, []);
    :     ^^
 13 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Parameter 'error' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/shared/ErrorBoundary.jsx:10:37]
  9 | 
 10 |     static getDerivedStateFromError(error) {
    :                                     ^^|^^
    :                                       `-- 'error' is declared here
 11 |         return { hasError: true };
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Variable 'activeGraph' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:8:9]
 7 | export default function AdminOverview({}) {
 8 |  const [activeGraph, setActiveGraph] = useState('attendance');
   :         ^^^^^|^^^^^
   :              `-- 'activeGraph' is declared here
 9 |  const [activeInsight, setActiveInsight] = useState(0);
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setActiveGraph' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:8:22]
 7 | export default function AdminOverview({}) {
 8 |  const [activeGraph, setActiveGraph] = useState('attendance');
   :                      ^^^^^^^|^^^^^^
   :                             `-- 'setActiveGraph' is declared here
 9 |  const [activeInsight, setActiveInsight] = useState(0);
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'graphData' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:12:9]
 11 | 
 12 |  const [graphData, setGraphData] = useState({
    :         ^^^^|^^^^
    :             `-- 'graphData' is declared here
 13 |  attendance: Array(12).fill(0),
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'tabs' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:107:8]
 106 | 
 107 |  const tabs = [
     :        ^^|^
     :          `-- 'tabs' is declared here
 108 |  { id: 'attendance', label: 'Attendance', color: 'bg-themeAccent' },
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'months' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:115:8]
 114 | 
 115 |  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     :        ^^^|^^
     :           `-- 'months' is declared here
 116 | 
     `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminOverview.jsx:7:39]
 6 | 
 7 | export default function AdminOverview({}) {
   :                                       ^^
 8 |  const [activeGraph, setActiveGraph] = useState('attendance');
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  x Unexpected token
    ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminHeroBanner.jsx:33:121]
 32 |  }
 33 |  } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
    :                                                                                                                         ^
 34 |  }
    `----

  ! eslint(no-unused-vars): Variable 'icon' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/DashboardWidgets/DashboardGreetingBanner.jsx:9:12]
  8 |     const [greeting, setGreeting] = useState('');
  9 |     const [icon, setIcon] = useState('');
    :            ^^|^
    :              `-- 'icon' is declared here
 10 |     const [subtitle, setSubtitle] = useState('');
    `----
  help: Consider removing this declaration.

  x Unexpected token
    ,-[Frontend/ERP/components/Admin/AdminDashboard/SQLStudio.jsx:51:118]
 50 |  
 51 |  } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } else {
    :                                                                                                                      ^^^^
 52 |  setError(err.message || "An error occurred while executing the query.");
    `----

  ! eslint(no-unused-vars): Variable 'pError' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/DashboardWidgets/AdminCampusPulse.jsx:20:44]
 19 |             // 1. Get total counts
 20 |             const { data: profiles, error: pError } = await supabase
    :                                            ^^^|^^
    :                                               `-- 'pError' is declared here
 21 |                 .from('profiles')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'aError' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/shared/DashboardWidgets/AdminCampusPulse.jsx:33:43]
 32 |             const today = new Date().toISOString().split('T')[0];
 33 |             const { data: attData, error: aError } = await supabase
    :                                           ^^^|^^
    :                                              `-- 'aError' is declared here
 34 |                 .from('attendance')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'totalAllocated' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:332:8]
 331 | 
 332 |  const totalAllocated = faculty.reduce((acc, curr) => acc + curr.mentees.length, 0);
     :        ^^^^^^^|^^^^^^
     :               `-- 'totalAllocated' is declared here
 333 | 
     `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
    ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx:11:47]
 10 | 
 11 | export default function MentorshipAllocations({}) {
    :                                               ^^
 12 |  const [maxCapacity, setMaxCapacity] = useState(5);
    `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Variable 'loading' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx:6:12]
 5 | export default function AdminKPIGrid({ setActiveTab }) {
 6 |     const [loading, setLoading] = useState(true);
   :            ^^^|^^^
   :               `-- 'loading' is declared here
 7 |     const [data, setData] = useState({
   `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminFAB.jsx:4:34]
 3 | 
 4 | export default function AdminFAB({}) {
   :                                  ^^
 5 |  const [isOpen, setIsOpen] = useState(false);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Identifier 'PDFDocument' is imported but never used.
   ,-[Frontend/ERP/DocumentTemplates/NativePayslipEngine.js:3:10]
 2 | import autoTable from "jspdf-autotable";
 3 | import { PDFDocument } from "pdf-lib";
   :          ^^^^^|^^^^^
   :               `-- 'PDFDocument' is imported here
 4 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'UpdatesCarousel' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:2:8]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";
   :        ^^^^^^^|^^^^^^^
   :               `-- 'UpdatesCarousel' is imported here
 3 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'BirthdayWidget' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:5:8]
 4 | import React, { useState } from "react";
 5 | import BirthdayWidget from "../../shared/BirthdayWidget";
   :        ^^^^^^^|^^^^^^
   :               `-- 'BirthdayWidget' is imported here
 6 | import { DashboardGreetingBanner } from "../../shared/DashboardWidgets";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'AdminCampusPulse' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:7:10]
 6 | import { DashboardGreetingBanner } from "../../shared/DashboardWidgets";
 7 | import { AdminCampusPulse, AdminSystemVitals } from "../../shared/DashboardWidgets";
   :          ^^^^^^^^|^^^^^^^
   :                  `-- 'AdminCampusPulse' is imported here
 8 | import AdminKPIGrid from "./AdminKPIGrid";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'OrganizationDirectory' is imported but never used.
    ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:9:8]
  8 | import AdminKPIGrid from "./AdminKPIGrid";
  9 | import OrganizationDirectory from "../../shared/OrganizationDirectory/OrganizationDirectory";
    :        ^^^^^^^^^^|^^^^^^^^^^
    :                  `-- 'OrganizationDirectory' is imported here
 10 | 
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'viewMode' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:16:9]
 15 |  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 16 |  const [viewMode, setViewMode] = useState('dashboard');
    :         ^^^^|^^^
    :             `-- 'viewMode' is declared here
 17 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setViewMode' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx:16:19]
 15 |  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 16 |  const [viewMode, setViewMode] = useState('dashboard');
    :                   ^^^^^|^^^^^
    :                        `-- 'setViewMode' is declared here
 17 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'useMemo' is imported but never used.
   ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:2:51]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import React, { useState, useEffect, useCallback, useMemo } from "react";
   :                                                   ^^^|^^^
   :                                                      `-- 'useMemo' is imported here
 3 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'rawRecords' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:14:9]
 13 |  const [attendanceData, setAttendanceData] = useState([]);
 14 |  const [rawRecords, setRawRecords] = useState([]);
    :         ^^^^^|^^^^
    :              `-- 'rawRecords' is declared here
 15 |  const [overallAttendance, setOverallAttendance] = useState(0);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'totalApproved' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:20:9]
 19 |  const [totalLate, setTotalLate] = useState(0);
 20 |  const [totalApproved, setTotalApproved] = useState(0);
    :         ^^^^^^|^^^^^^
    :               `-- 'totalApproved' is declared here
 21 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
    ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:56:14]
 55 |         setAppealReason("");
 56 |     } catch (e) {
    :              |
    :              `-- 'e' is declared here
 57 |         window.erpDialog?.alert("Failed to file appeal.");
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Parameter 'payload' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:344:18]
 343 |                 { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${targetUserId}` },
 344 |                 (payload) => {
     :                  ^^^|^^^
     :                     `-- 'payload' is declared here
 345 |                     fetchAcademicData();
     `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'err' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:381:61]
 380 |      const position = await new Promise((resolve, reject) => {
 381 |          navigator.geolocation.getCurrentPosition(resolve, (err) => {
     :                                                             ^|^
     :                                                              `-- 'err' is declared here
 382 |              reject(new Error("Please enable location services to mark attendance."));
     `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'targetUserId'
     ,-[Frontend/ERP/components/Student/Attendance/Attendance.jsx:353:8]
 336 |     useEffect(() => {
 337 |         if (!targetUserId) return;
     :              ^^^^^^|^^^^^
     :                    `-- useEffect uses `targetUserId` here
 338 |         
 339 |         const channel = supabase
 340 |             .channel('student-attendance-updates')
 341 |             .on(
 342 |                 'postgres_changes',
 343 |                 { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${targetUserId}` },
 344 |                 (payload) => {
 345 |                     fetchAcademicData();
 346 |                 }
 347 |             )
 348 |             .subscribe();
 349 | 
 350 |         return () => {
 351 |             supabase.removeChannel(channel);
 352 |         };
 353 |     }, [userSession, fetchAcademicData]);
     :        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 354 | 
     `----
  help: Either include it or remove the dependency array.

  x Unexpected token
     ,-[Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx:203:127]
 202 |  addLog(`[SUCCESS] Setup link successfully dispatched to ${app.email}!`);
 203 |  } catch (emailErr) { console.error(emailErr); if (window.toast) window.toast.error("An error occurred. Please try again."); }. The account was created successfully, but credentials must be provided manually.`);
     :                                                                                                                               ^
 204 |  }
     `----

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
    ,-[Frontend/ERP/context/ErpContext.jsx:22:14]
 21 |         return decryptedString ? JSON.parse(decryptedString) : null;
 22 |     } catch (e) {
    :              |
    :              `-- 'e' is declared here
 23 |         return null;
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
     ,-[Frontend/ERP/context/ErpContext.jsx:300:26]
 299 |                     }
 300 |                 } catch (e) {
     :                          |
     :                          `-- 'e' is declared here
 301 |                     targets = [n.target_audience];
     `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
     ,-[Frontend/ERP/context/ErpContext.jsx:363:25]
 362 |                     setUnreadNotifications(allNotifs.filter(n => !n.is_read).length);
 363 |                 } catch(e) {}
     :                         |
     :                         `-- 'e' is declared here
 364 |             };
     `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Variable 'targetedNotifsChannel' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/context/ErpContext.jsx:395:19]
 394 |             // Realtime Listener for Targeted Notifications Table
 395 |             const targetedNotifsChannel = supabase.channel(`realtime_targeted_notifs_${userSession.db_id}_${Date.now()}`)
     :                   ^^^^^^^^^^|^^^^^^^^^^
     :                             `-- 'targetedNotifsChannel' is declared here
 396 |                 .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userSession.db_id}` }, (payload) => {
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'chatChannel' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/context/ErpContext.jsx:419:19]
 418 |             // Realtime Listener for Mentorship Messages (Hero Reveal)
 419 |             const chatChannel = supabase.channel(`realtime_chats_${userSession.db_id}_${Date.now()}`)
     :                   ^^^^^|^^^^^
     :                        `-- 'chatChannel' is declared here
 420 |                 .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentorship_messages', filter: `receiver_id=eq.${userSession.db_id}` }, (payload) => {
     `----
  help: Consider removing this declaration.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
    ,-[Frontend/ERP/context/ErpContext.jsx:28:14]
 27 | const ErpContext = createContext();
 28 | export const useERP = () => useContext(ErpContext);
    :              ^^^^^^
 29 | 
    `----

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'addFlag'
     ,-[Frontend/ERP/context/ErpContext.jsx:443:8]
 400 |                     // Show Hero Reveal (Toast)
 401 |                     addFlag({
     :                     ^^^|^^^
     :                        `-- useEffect uses `addFlag` here
 402 |                         title: newNotif.title,
 403 |                         description: newNotif.message,
 404 |                         type: 'info',
 405 |                         duration: 8000
 406 |                     });
 407 | 
 408 |                     // Trigger Native Push
 409 |                     if ("Notification" in window && Notification.permission === "granted") {
 410 |                         new Notification(newNotif.title, {
 411 |                             body: newNotif.message,
 412 |                             icon: '/favicon.ico'
 413 |                         });
 414 |                     }
 415 |                 })
 416 |                 .subscribe();
 417 | 
 418 |             // Realtime Listener for Mentorship Messages (Hero Reveal)
 419 |             const chatChannel = supabase.channel(`realtime_chats_${userSession.db_id}_${Date.now()}`)
 420 |                 .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentorship_messages', filter: `receiver_id=eq.${userSession.db_id}` }, (payload) => {
 421 |                     const msg = payload.new;
 422 |                     
 423 |                     addFlag({
 424 |                         title: "New Message",
 425 |                         description: msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content,
 426 |                         type: 'success',
 427 |                         duration: 8000
 428 |                     });
 429 | 
 430 |                     if ("Notification" in window && Notification.permission === "granted") {
 431 |                         new Notification("New Message Received", {
 432 |                             body: msg.content,
 433 |                             icon: '/favicon.ico'
 434 |                         });
 435 |                     }
 436 |                 })
 437 |                 .subscribe();
 438 | 
 439 |             return () => {
 440 |                 supabase.removeChannel(noticeChannel);
 441 |             };
 442 |         }
 443 |     }, [userSession]);
     :        ^^^^^^^^^^^^^
 444 | 
     `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useMemo has missing dependencies: 'getTimetableForBatch', 'getFacultySlots', and 'refreshProfile'
     ,-[Frontend/ERP/context/ErpContext.jsx:733:9]
 519 |             logout,
 520 |             refreshProfile,
     :             ^^^^^^^^^^^^^^
 521 |             notices,
 522 |             universalNotifications,
 523 |             setUniversalNotifications,
 524 |             unreadNotifications,
 525 |             setUnreadNotifications,
 526 |             addNotice: async (notice) => {
 527 |             if (!userSession) return;
 528 |             try {
 529 |                 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 530 |                 const insertData = {
 531 |                     notice_id: noticeId,
 532 |                     title: notice.title,
 533 |                     category: notice.category || 'General',
 534 |                     target_audience: notice.target_audience || notice.target_role || 'global',
 535 |                     target_id: notice.target_id || null,
 536 |                     priority: notice.priority || 'normal',
 537 |                     content: notice.content,
 538 |                     author_name: notice.author_name || userSession.name,
 539 |                     author_id: userSession.id
 540 |                 };
 541 |                 const { data, error } = await supabase.from('notices').insert([insertData]).select();
 542 |                 if (error) throw error;
 543 |                 // realtime listener handles state update, but we can optimistically update
 544 |                 if (data && data.length > 0) {
 545 |                     setNotices(prev => [data[0], ...prev]);
 546 |                 }
 547 |                 return { success: true, data };
 548 |             } catch (e) {
 549 |                 console.error('Add notice failed', e);
 550 |                 return { success: false, error: e };
 551 |             }
 552 |         }, deleteNotice: async (id) => {
 553 |             if (!userSession) return;
 554 |             try {
 555 |                 const { error } = await supabase.from('notices').delete().eq('id', id);
 556 |                 if (error) throw error;
 557 |                 setNotices(prev => prev.filter(n => n.id !== id));
 558 |                 return { success: true };
 559 |             } catch (e) {
 560 |                 console.error('Delete notice failed', e);
 561 |                 return { success: false, error: e };
 562 |             }
 563 |         }, refreshNotices: async () => {
 564 |             if (!userSession) return;
 565 |             try {
 566 |                 const { data, error } = await supabase.from('notices').select('*').limit(500).order('created_at', { ascending: false });
 567 |                 if (error) throw error;
 568 |                 setNotices(data);
 569 |                 return { success: true, data };
 570 |             } catch (e) {
 571 |                 console.error('Refresh notices failed', e);
 572 |                 return { success: false, error: e };
 573 |             }
 574 |         },
 575 |         events, addEvent: async (eventData) => {
 576 |             if (!userSession) return { success: false };
 577 |             try {
 578 |                 const insertData = {
 579 |                     title: eventData.title,
 580 |                     description: eventData.description,
 581 |                     event_date: eventData.event_date,
 582 |                     location: eventData.location || "TBA",
 583 |                     image_url: eventData.image_url || null,
 584 |                     is_public: eventData.is_public || false,
 585 |                     author_name: userSession.name,
 586 |                     author_id: userSession.id
 587 |                 };
 588 |                 const { data, error } = await supabase.from('admin_events').insert([insertData]).select();
 589 |                 if (error) throw error;
 590 |                 if (data && data.length > 0) {
 591 |                     setEvents(prev => [...prev, data[0]].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
 592 |                 }
 593 |                 return { success: true, data };
 594 |             } catch (e) {
 595 |                 console.error('Add event failed', e);
 596 |                 return { success: false, error: e };
 597 |             }
 598 |         }, deleteEvent: async (id) => {
 599 |             if (!userSession) return { success: false };
 600 |             try {
 601 |                 const { error } = await supabase.from('admin_events').delete().eq('id', id);
 602 |                 if (error) throw error;
 603 |                 setEvents(prev => prev.filter(e => e.id !== id));
 604 |                 return { success: true };
 605 |             } catch (e) {
 606 |                 console.error('Delete event failed', e);
 607 |                 return { success: false, error: e };
 608 |             }
 609 |         }, updateEventGallery: async (id, urls) => {
 610 |             if (!userSession) return { success: false };
 611 |             try {
 612 |                 const { data, error } = await supabase.from('admin_events')
 613 |                     .update({ image_urls: urls })
 614 |                     .eq('id', id)
 615 |                     .select();
 616 |                 if (error) throw error;
 617 |                 if (data && data.length > 0) {
 618 |                     setEvents(prev => prev.map(e => e.id === id ? { ...e, image_urls: urls } : e));
 619 |                 }
 620 |                 return { success: true, data };
 621 |             } catch (e) {
 622 |                 console.error('Update event gallery failed', e);
 623 |                 return { success: false, error: e };
 624 |             }
 625 |         }, refreshEvents: async () => {
 626 |             if (!userSession) return;
 627 |             try {
 628 |                 const { data, error } = await supabase.from('admin_events').select('*').limit(500).order('event_date', { ascending: true });
 629 |                 if (error) throw error;
 630 |                 setEvents(data);
 631 |                 return { success: true, data };
 632 |             } catch (e) {
 633 |                 console.error('Refresh events failed', e);
 634 |                 return { success: false, error: e };
 635 |             }
 636 |         },
 637 |         batches: [], faculty: [], rooms: [], subjects: [], globalTimetable, facultyTimetable,
 638 |         getTimetableForBatch,
     :         ^^^^^^^^^^^^^^^^^^^^
 639 |         getFacultySlots,
     :         ^^^^^^^^^^^^^^^
 640 |         // Attendance helpers
 641 |         fetchAttendance: async (batchId) => {
 642 |             if (!userSession) return;
 643 |             try {
 644 |                 const { data, error } = await supabase.from('attendance').select('*').limit(2000).eq('batch_id', batchId);
 645 |                 if (error) throw error;
 646 |                 const byDay = {};
 647 |                 data.forEach(rec => {
 648 |                     const day = rec.day_of_week || 'Unknown';
 649 |                     byDay[day] = byDay[day] || [];
 650 |                     byDay[day].push(rec);
 651 |                 });
 652 |                 setAttendanceCache(prev => ({ ...prev, [batchId]: byDay }));
 653 |             } catch (e) {
 654 |                 console.error('Failed to load attendance', e);
 655 |             }
 656 |         },
 657 |         getAttendanceForDay: (batchId, day) => {
 658 |             return (attendanceCache[batchId] && attendanceCache[batchId][day]) || [];
 659 |         },
 660 |         requestLeave: async (classId, reason) => {
 661 |             if (!userSession) return { success: false };
 662 |             try {
 663 |                 const { data, error } = await supabase.from('leave_requests').insert([
 664 |                     {
 665 |                         student_id: userSession.db_id,
 666 |                         reason,
 667 |                         status: 'pending'
 668 |                     }
 669 |                 ]);
 670 |                 if (error) throw error;
 671 |                 return { success: true, data };
 672 |             } catch (e) {
 673 |                 console.error('Leave request failed', e);
 674 |                 return { success: false, error: e };
 675 |             }
 676 |         },
 677 |         approveLeave: async (requestId, decision) => {
 678 |             if (!userSession) return { success: false };
 679 |             try {
 680 |                 const { data, error } = await supabase.from('leave_requests')
 681 |                     .update({ status: decision, reviewed_at: new Date().toISOString() })
 682 |                     .eq('id', requestId);
 683 |                 if (error) throw error;
 684 |                 return { success: true, data };
 685 |             } catch (e) {
 686 |                 console.error('Leave approval failed', e);
 687 |                 return { success: false, error: e };
 688 |             }
 689 |         },
 690 |         attendanceCache, updateAttendanceCache, clearAttendanceCache,
 691 |         assignSlot: async (data) => {
 692 |             const { error } = await supabase.from('faculty_timetable').insert([data]);
 693 |             if (error) throw error;
 694 |         },
 695 |         clearSlot: async (id) => {
 696 |             const { error } = await supabase.from('faculty_timetable').delete().eq('id', id);
 697 |             if (error) throw error;
 698 |         },
 699 |         submitAttendance: async (records) => {
 700 |             const { error } = await supabase.from('attendance').insert(records);
 701 |             if (error) throw error;
 702 |             clearAttendanceCache();
 703 |         },
 704 |         publishAssignment: async (data) => {
 705 |             const { error } = await supabase.from('assignments').insert([data]);
 706 |             if (error) throw error;
 707 |         },
 708 |         submitGrade: async (data) => {
 709 |             const { error } = await supabase.from('student_grades').upsert([data], { onConflict: 'student_id,assignment_id' });
 710 |             if (error) throw error;
 711 |         },
 712 |         submitMarksToCOE: async (assignmentId) => {
 713 |             const { error } = await supabase.from('student_grades').update({ is_submitted_to_coe: true }).eq('assignment_id', assignmentId);
 714 |             if (error) throw error;
 715 |         },
 716 |         processStudentRequest: async (id, status, resolverId) => {
 717 |             const { error } = await supabase.from('student_requests').update({ status, resolved_by: resolverId }).eq('id', id);
 718 |             if (error) throw error;
 719 |         },
 720 |         processFacultyLeave: async (id, status, reviewerId) => {
 721 |             const { error } = await supabase.from('faculty_leave_requests').update({ status, reviewed_by: reviewerId }).eq('id', id);
 722 |             if (error) throw error;
 723 |         },
 724 |         submitFacultyLeave: async (data) => {
 725 |             const { error } = await supabase.from('faculty_leave_requests').insert([data]);
 726 |             if (error) throw error;
 727 |         },
 728 |         updateMeetingNotes: async (data) => {
 729 |             const { error } = await supabase.from('mentorship_notes').insert([data]);
 730 |             if (error) throw error;
 731 |         }
 732 |         
 733 |     }), [userSession, isAppLoading, isSidebarCollapsed, activeTheme, layoutPreference, navLayout, sidebarMode, notices, universalNotifications, unreadNotifications, events, attendanceCache, globalTimetable, facultyTimetable])}>
     :         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 734 |             {children}
     `----
  help: Either include it or remove the dependency array.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipReports.jsx:6:43]
 5 | 
 6 | export default function MentorshipReports({}) {
   :                                           ^^
 7 |  const [isGenerating, setIsGenerating] = useState(false);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
    ,-[Frontend/Shared/context/NotificationContext.jsx:9:14]
  8 | 
  9 | export const useNotification = () => {
    :              ^^^^^^^^^^^^^^^
 10 |     const context = useContext(NotificationContext);
    `----

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipLogs.jsx:5:40]
 4 | 
 5 | export default function MentorshipLogs({}) {
   :                                        ^^
 6 |  const [logs, setLogs] = useState([]);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Identifier 'PageHeader' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminWebsiteHub/AdminWebsiteInquiries.jsx:4:8]
 3 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 4 | import PageHeader from "../../shared/PageHeader/PageHeader";
   :        ^^^^^|^^^^
   :             `-- 'PageHeader' is imported here
 5 | import { sendSystemEmail } from "../../../lib/EmailService";
   `----
  help: Consider removing this import.

  x Unexpected token
    ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipDashboard.jsx:71:121]
 70 | 
 71 |  } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
    :                                                                                                                         ^
 72 |  }
    `----

  ! eslint(no-useless-escape): Unnecessary escape character '.'
    ,-[Frontend/ERP/DocumentTemplates/IDCardTemplate.jsx:14:104]
 13 |         
 14 |         const prog = (profileData?.programme || profileData?.department || '').toLowerCase().replace(/[\.\s]/g, '');
    :                                                                                                        ^^
 15 |         
    `----
  help: Replace `\.` with `.`.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'previewCtx'
    ,-[Frontend/Shared/lib/hooks/useSiteContent.js:15:13]
 14 |         const previewKey = `${pagePath}::${sectionName}`;
 15 |         if (previewCtx && previewCtx.previewData && previewCtx.previewData[previewKey]) {
    :             ^^^^^|^^^^
    :                  `-- useEffect uses `previewCtx` here
 16 |             setContent(previewCtx.previewData[previewKey]);
    `----
    ,-[Frontend/Shared/lib/hooks/useSiteContent.js:44:8]
 43 |         fetchContent();
 44 |     }, [pagePath, sectionName, previewCtx?.previewData]);
    :        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 45 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'setErrorMsg' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Public/CredentialVerification.jsx:11:22]
 10 |     const [documents, setDocuments] = useState([]);
 11 |     const [errorMsg, setErrorMsg] = useState("");
    :                      ^^^^^|^^^^^
    :                           `-- 'setErrorMsg' is declared here
 12 | 
    `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'generateAndSendOTP'
    ,-[Frontend/ERP/components/Login/OTPVerification.jsx:47:6]
 44 |       hasInitialized.current = true;
 45 |       generateAndSendOTP();
    :       ^^^^^^^^^|^^^^^^^^
    :                `-- useEffect uses `generateAndSendOTP` here
 46 |     }
 47 |   }, [email]);
    :      ^^^^^^^
 48 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'verify'
    ,-[Frontend/ERP/components/Login/OTPVerification.jsx:71:6]
 69 |   useEffect(() => {
 70 |     if (value.length === 4) verify(value);
    :                             ^^^|^^
    :                                `-- useEffect uses `verify` here
 71 |   }, [value]);
    :      ^^^^^^^
 72 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'MapPin' is imported but never used.
   ,-[Frontend/Website/components/HOME/CONTACT/HomeContact.jsx:3:10]
 2 | import React, { forwardRef } from 'react';
 3 | import { MapPin, Phone, Mail, ArrowRight, ArrowUp } from 'lucide-react';
   :          ^^^|^^
   :             `-- 'MapPin' is imported here
 4 | import CountUp from './CountUp';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'PageHeader' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx:4:8]
 3 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 4 | import PageHeader from "../../shared/PageHeader/PageHeader";
   :        ^^^^^|^^^^
   :             `-- 'PageHeader' is imported here
 5 | import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Parameter 'notification' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Shared/utils/PushEngine.js:48:68]
 47 |         // Show push notification payload when app is open (Foreground)
 48 |         PushNotifications.addListener('pushNotificationReceived', (notification) => {
    :                                                                    ^^^^^^|^^^^^
    :                                                                          `-- 'notification' is declared here
 49 |             // Trigger a UI toast or internal event here if needed
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'notification' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Shared/utils/PushEngine.js:53:75]
 52 |         // Action performed on a push notification (Background/Tapped)
 53 |         PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    :                                                                           ^^^^^^|^^^^^
    :                                                                                 `-- 'notification' is declared here
 54 |             // Navigate to specific screen based on payload
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'cascade' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Shared/components/ReactBits/CodeSlots/CodeSlots.jsx:25:3]
 24 |   rise = 8,
 25 |   cascade = 20,
    :   ^^^|^^^
    :      `-- 'cascade' is declared here
 26 |   haptic = true,
    `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'triggerShake'
    ,-[Frontend/Shared/components/ReactBits/CodeSlots/CodeSlots.jsx:47:6]
 45 |   useEffect(() => {
 46 |     if (status === 'error') triggerShake();
    :                             ^^^^^^|^^^^^
    :                                   `-- useEffect uses `triggerShake` here
 47 |   }, [status]);
    :      ^^^^^^^^
 48 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'addRow' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx:162:11]
 161 |     // Entry form handlers
 162 |     const addRow = () => {
     :           ^^^|^^
     :              `-- 'addRow' is declared here
 163 |         setEntryRows(prev => [...prev, { subject_name: '', subject_code: '', marks_obtained: '', max_marks: 100, grade: '', credits: '', result: 'pass' }]);
     `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchAll'
    ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx:50:8]
 48 |     useEffect(() => {
 49 |         if (menteeId) fetchAll();
    :                       ^^^^|^^^
    :                           `-- useEffect uses `fetchAll` here
 50 |     }, [menteeId]);
    :        ^^^^^^^^^^
 51 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has missing dependencies: 'studentProfile', and 'studentProfile.programme'
     ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx:122:8]
  86 |     useEffect(() => {
  87 |         if (showEntryForm && entrySemester && studentProfile) {
     :                                               ^^^^^^^^^^^^^^
  88 |             const fetchSubjects = async () => {
  89 |                 // Find program ID
  90 |                 const { data: progs } = await supabase.from('academic_programs').select('id, name');
  91 |                 if (!progs) return;
  92 |                 const match = progs.find(p => {
  93 |                     if (!studentProfile.programme) return false;
     :                          ^^^^^^^^^^^^^^
  94 |                     const p1 = studentProfile.programme.toLowerCase().replace(/\./g, '').trim();
  95 |                     const p2 = p.name.toLowerCase().replace(/\./g, '').trim();
  96 |                     return p1.includes(p2) || p2.includes(p1);
  97 |                 });
  98 |                 if (!match) return;
  99 | 
 100 |                 const { data: subs } = await supabase.from('master_subjects')
 101 |                     .select('name, code, credits')
 102 |                     .eq('program_id', match.id)
 103 |                     .eq('target_semester', parseInt(entrySemester))
 104 |                     .eq('status', 'active');
 105 |                 
 106 |                 if (subs && subs.length > 0) {
 107 |                     setEntryRows(subs.map(s => ({
 108 |                         subject_name: s.name,
 109 |                         subject_code: s.code || '',
 110 |                         marks_obtained: '',
 111 |                         max_marks: 100,
 112 |                         grade: '',
 113 |                         credits: s.credits || '',
 114 |                         result: 'pass'
 115 |                     })));
 116 |                 } else {
 117 |                     setEntryRows([]);
 118 |                 }
 119 |             };
 120 |             fetchSubjects();
 121 |         }
 122 |     }, [entrySemester, showEntryForm]);
     :        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 123 | 
     `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Parameter 'index' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Website/components/NAVBAR/ACADEMICS/AcademicCalendar.jsx:95:49]
 94 |                         <div className="relative border-l-2 border-black/10 dark:border-white/10 pl-6 md:pl-10 py-4 ml-4 md:ml-6 flex flex-col gap-10">
 95 |                             {events.map((event, index) => (
    :                                                 ^^|^^
    :                                                   `-- 'index' is declared here
 96 |                                 <div key={event.id} className="relative group">
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'i' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/Shared/utils/ExcelExport.js:63:40]
 62 |     // 5. Auto-size columns
 63 |     worksheet.columns.forEach((column, i) => {
    :                                        |
    :                                        `-- 'i' is declared here
 64 |         let maxLength = 0;
    `----
  help: Consider removing this parameter.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   ,-[Frontend/Website/context/SiteContext.jsx:6:14]
 5 | const SiteContext = createContext();
 6 | export const useSite = () => useContext(SiteContext);
   :              ^^^^^^^
 7 | 
   `----

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchGrievances'
    ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeGrievances.jsx:11:8]
  9 |     useEffect(() => {
 10 |         if(menteeId) fetchGrievances();
    :                      ^^^^^^^|^^^^^^^
    :                             `-- useEffect uses `fetchGrievances` here
 11 |     }, [menteeId]);
    :        ^^^^^^^^^^
 12 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchStudentData'
    ,-[Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx:26:8]
 24 |         window.scrollTo(0, 0);
 25 |         fetchStudentData();
    :         ^^^^^^^^|^^^^^^^
    :                 `-- useEffect uses `fetchStudentData` here
 26 |     }, []);
    :        ^^
 27 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchStudentData'
     ,-[Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx:132:8]
 129 |         if (!studentData) return;
 130 |         const channel = supabase.channel('parent-attendance-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${studentData.id}` }, () => { fetchStudentData(); }).subscribe();
     :                                                                                                                                                                                                                ^^^^^^^^|^^^^^^^
     :                                                                                                                                                                                                                        `-- useEffect uses `fetchStudentData` here
 131 |         return () => { supabase.removeChannel(channel); };
 132 |     }, [studentData]);
     :        ^^^^^^^^^^^^^
 133 | 
     `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'isBefore' is imported but never used.
   ,-[Frontend/ERP/lib/facultyAttendanceRules.js:1:10]
 1 | import { isBefore, isAfter, differenceInMinutes, parse, getDay, getDate } from 'date-fns';
   :          ^^^^|^^^
   :              `-- 'isBefore' is imported here
 2 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'isAfter' is imported but never used.
   ,-[Frontend/ERP/lib/facultyAttendanceRules.js:1:20]
 1 | import { isBefore, isAfter, differenceInMinutes, parse, getDay, getDate } from 'date-fns';
   :                    ^^^|^^^
   :                       `-- 'isAfter' is imported here
 2 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'parse' is imported but never used.
   ,-[Frontend/ERP/lib/facultyAttendanceRules.js:1:50]
 1 | import { isBefore, isAfter, differenceInMinutes, parse, getDay, getDate } from 'date-fns';
   :                                                  ^^|^^
   :                                                    `-- 'parse' is imported here
 2 | 
   `----
  help: Consider removing this import.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
    ,-[Frontend/Website/context/PreviewContext.jsx:23:17]
 22 | 
 23 | export function usePreview() {
    :                 ^^^^^^^^^^
 24 |     return useContext(PreviewContext);
    `----

  ! react(only-export-components): Fast refresh only works when a file only exports components. Move your React context(s) to a separate file.
   ,-[Frontend/Website/context/PreviewContext.jsx:4:14]
 3 | 
 4 | export const PreviewContext = createContext();
   :              ^^^^^^^^^^^^^^
 5 | 
   `----

  ! eslint(no-unused-vars): Identifier 'useScroll' is imported but never used.
   ,-[Frontend/Website/components/UI/NotFound404.jsx:3:18]
 2 | import React, { useState, useEffect, useRef } from 'react';
 3 | import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
   :                  ^^^^|^^^^
   :                      `-- 'useScroll' is imported here
 4 | import { Link } from 'react-router-dom';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'useTransform' is imported but never used.
   ,-[Frontend/Website/components/UI/NotFound404.jsx:3:29]
 2 | import React, { useState, useEffect, useRef } from 'react';
 3 | import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
   :                             ^^^^^^|^^^^^
   :                                   `-- 'useTransform' is imported here
 4 | import { Link } from 'react-router-dom';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'useSpring' is imported but never used.
   ,-[Frontend/Website/components/UI/NotFound404.jsx:3:43]
 2 | import React, { useState, useEffect, useRef } from 'react';
 3 | import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
   :                                           ^^^^|^^^^
   :                                               `-- 'useSpring' is imported here
 4 | import { Link } from 'react-router-dom';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'ExternalLink' is imported but never used.
   ,-[Frontend/Website/components/UI/GlobeMap.jsx:6:10]
 5 | import "leaflet/dist/leaflet.css";
 6 | import { ExternalLink } from "lucide-react";
   :          ^^^^^^|^^^^^
   :                `-- 'ExternalLink' is imported here
 7 | 
   `----
  help: Consider removing this import.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchDashboardData'
    ,-[Frontend/ERP/components/Faculty/FacultyAcademicHub/components/FacultyTeachingDashboard.jsx:25:8]
 22 |             }
 23 |             fetchDashboardData();
    :             ^^^^^^^^^|^^^^^^^^
    :                      `-- useEffect uses `fetchDashboardData` here
 24 |         }
 25 |     }, [userSession]);
    :        ^^^^^^^^^^^^^
 26 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'ArrowRight' is imported but never used.
   ,-[Frontend/Website/components/UI/PremiumFooter/CTASection.jsx:5:10]
 4 | import styles from './PremiumFooter.module.css';
 5 | import { ArrowRight, ArrowUpRight } from 'lucide-react';
   :          ^^^^^|^^^^
   :               `-- 'ArrowRight' is imported here
 6 | import { theme } from '../../../../Shared/theme';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'ArrowUpRight' is imported but never used.
   ,-[Frontend/Website/components/UI/PremiumFooter/CTASection.jsx:5:22]
 4 | import styles from './PremiumFooter.module.css';
 5 | import { ArrowRight, ArrowUpRight } from 'lucide-react';
   :                      ^^^^^^|^^^^^
   :                            `-- 'ArrowUpRight' is imported here
 6 | import { theme } from '../../../../Shared/theme';
   `----
  help: Consider removing this import.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   ,-[Frontend/ERP/components/Faculty/FacultySidebar/FacultySidebar.jsx:5:14]
 4 | 
 5 | export const FACULTY_NAV_MEGA = [
   :              ^^^^^^^^^^^^^^^^
 6 |   {
   `----

  ! eslint(no-unused-vars): Variable 'logsError' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx:45:40]
 44 |             // 3. Get manual admin overrides from faculty_daily_presence
 45 |             const { data: logs, error: logsError } = await supabase
    :                                        ^^^^|^^^^
    :                                            `-- 'logsError' is declared here
 46 |                 .from('faculty_daily_presence')
    `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchAttendanceData'
    ,-[Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx:21:8]
 19 |     useEffect(() => {
 20 |         fetchAttendanceData();
    :         ^^^^^^^^^|^^^^^^^^^
    :                  `-- useEffect uses `fetchAttendanceData` here
 21 |     }, [selectedDate]);
    :        ^^^^^^^^^^^^^^
 22 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'PCL_LOGO_SVG' is declared but never used. Unused variables should start with a '_'.
   ,-[Frontend/ERP/lib/emailtemplate.js:3:7]
 2 | 
 3 | const PCL_LOGO_SVG = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   :       ^^^^^^|^^^^^
   :             `-- 'PCL_LOGO_SVG' is declared here
 4 |      width="1024" height="1024" viewBox="0 0 1024 1024" enable-background="new 0 0 1024 1024" xml:space="preserve">
   `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'Activity' is imported but never used.
   ,-[Frontend/Website/components/UI/PremiumFooter/BottomStrip.jsx:4:19]
 3 | import { Link } from 'react-router-dom';
 4 | import { ArrowUp, Activity } from 'lucide-react';
   :                   ^^^^|^^^
   :                       `-- 'Activity' is imported here
 5 | import styles from './PremiumFooter.module.css';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'ValorLogo' is imported but never used.
   ,-[Frontend/Website/components/UI/PremiumFooter/BottomStrip.jsx:6:8]
 5 | import styles from './PremiumFooter.module.css';
 6 | import ValorLogo from '../../../../ERP/components/shared/ValorLogo';
   :        ^^^^|^^^^
   :            `-- 'ValorLogo' is imported here
 7 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'HoldButton' is imported but never used.
   ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:7:8]
 6 | 
 7 | import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
   :        ^^^^^|^^^^
   :             `-- 'HoldButton' is imported here
 8 | import { HugeiconsIcon } from '@hugeicons/react';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'HugeiconsIcon' is imported but never used.
   ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:8:10]
 7 | import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
 8 | import { HugeiconsIcon } from '@hugeicons/react';
   :          ^^^^^^|^^^^^^
   :                `-- 'HugeiconsIcon' is imported here
 9 | import { Delete02Icon } from '@hugeicons/core-free-icons';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Delete02Icon' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:9:10]
  8 | import { HugeiconsIcon } from '@hugeicons/react';
  9 | import { Delete02Icon } from '@hugeicons/core-free-icons';
    :          ^^^^^^|^^^^^
    :                `-- 'Delete02Icon' is imported here
 10 | 
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'ClassRoster' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:15:8]
 14 | import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
 15 | import ClassRoster from "../ClassRoster/ClassRoster";
    :        ^^^^^|^^^^^
    :             `-- 'ClassRoster' is imported here
 16 | import SyllabusEditorModal from "../../Admin/AdminTimetableBuilder/tabs/components/SyllabusEditorModal";
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'getBatchColorKey' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:34:7]
 33 | // Helper to derive color from batch name (mimicking Cohort colors)
 34 | const getBatchColorKey = (batchName) => {
    :       ^^^^^^^^|^^^^^^^
    :               `-- 'getBatchColorKey' is declared here
 35 |     if (!batchName) return 'default';
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'setActiveTab' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:44:63]
 43 | 
 44 | export default function FacultyCourses({ isEmbedded = false,  setActiveTab }) {
    :                                                               ^^^^^^|^^^^^
    :                                                                     `-- 'setActiveTab' is declared here
 45 |  const { userSession } = useERP();
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Variable 'handleResourceClick' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:65:11]
 64 | 
 65 |     const handleResourceClick = (e, item) => {
    :           ^^^^^^^^^|^^^^^^^^^
    :                    `-- 'handleResourceClick' is declared here
 66 |         if (item.url && item.url.includes('drive.google.com/file/d/')) {
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'batchStr' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:341:8]
 340 |  const isSelected = selectedCourse?.id === course.id;
 341 |  const batchStr = course.batches?.[0] || "";
     :        ^^^^|^^^
     :            `-- 'batchStr' is declared here
 342 |   const tColor = THEME_COLORS[course.master_subjects?.theme_color] || THEME_COLORS.default;
     `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchCourseData'
    ,-[Frontend/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx:88:5]
 85 |         }
 86 |         fetchCourseData();
    :         ^^^^^^^|^^^^^^^
    :                `-- useEffect uses `fetchCourseData` here
 87 |     }
 88 |  }, [userSession]);
    :     ^^^^^^^^^^^^^
 89 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'leaves' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:61:27]
 60 |             const { data: attData } = await supabase.from('attendance_records').select('student_id, entry_status, status');
 61 |             const { data: leaves } = await supabase.from('leave_requests').select('student_id, status').eq('status', 'approved');
    :                           ^^^|^^
    :                              `-- 'leaves' is declared here
 62 | 
    `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchDebarmentData'
    ,-[Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx:87:8]
 85 |         if (activeTab === 'appeals') fetchAppeals();
 86 |         else fetchDebarmentData();
    :              ^^^^^^^^^|^^^^^^^^
    :                       `-- useEffect uses `fetchDebarmentData` here
 87 |     }, [activeTab, debarBatch, debarThreshold]);
    :        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 88 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Parameter 'timetableData' is declared but never used. Unused parameters should start with a '_'.
   ,-[Frontend/Shared/utils/NotificationEngine.js:5:47]
 4 | 
 5 | export const scheduleTimetableAlerts = async (timetableData) => {
   :                                               ^^^^^^|^^^^^^
   :                                                     `-- 'timetableData' is declared here
 6 |     if (!Capacitor.isNativePlatform()) return;
   `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Variable 'scheduledNotifications' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Shared/utils/NotificationEngine.js:18:15]
 17 | 
 18 |         const scheduledNotifications = [];
    :               ^^^^^^^^^^^|^^^^^^^^^^
    :                          `-- 'scheduledNotifications' is declared here
 19 |         let idCounter = 1000;
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'idCounter' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/Shared/utils/NotificationEngine.js:19:13]
 18 |         const scheduledNotifications = [];
 19 |         let idCounter = 1000;
    :             ^^^^|^^^^
    :                 `-- 'idCounter' is declared here
 20 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'OrganizationDirectory' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:10:8]
  9 | 
 10 | import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';
    :        ^^^^^^^^^^|^^^^^^^^^^
    :                  `-- 'OrganizationDirectory' is imported here
 11 | import { useERP } from "../../../context/ErpContext";
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'viewMode' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:15:12]
 14 | export default function FacultyDashboard({ setActiveTab }) {
 15 |     const [viewMode, setViewMode] = useState('dashboard');
    :            ^^^^|^^^
    :                `-- 'viewMode' is declared here
 16 |     const { userSession, notices } = useERP();
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'setViewMode' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx:15:22]
 14 | export default function FacultyDashboard({ setActiveTab }) {
 15 |     const [viewMode, setViewMode] = useState('dashboard');
    :                      ^^^^^|^^^^^
    :                           `-- 'setViewMode' is declared here
 16 |     const { userSession, notices } = useERP();
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Identifier 'PageHeader' is imported but never used.
   ,-[Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:3:8]
 2 | import React, { useState, useEffect } from "react";
 3 | import PageHeader from "../../shared/PageHeader/PageHeader";
   :        ^^^^^|^^^^
   :             `-- 'PageHeader' is imported here
 4 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'getBatchColorKey' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:15:7]
 14 | 
 15 | const getBatchColorKey = (batchName) => {
    :       ^^^^^^^^|^^^^^^^
    :               `-- 'getBatchColorKey' is declared here
 16 |     if (!batchName) return 'default';
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'students' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:219:20]
 218 |      // Get students in this batch
 219 |      const { data: students } = await supabase.from('profiles').select('email').eq('role', 'student');
     :                    ^^^^|^^^
     :                        `-- 'students' is declared here
 220 |      // In a real scenario, we'd filter by batch. Here we just get all students for simplicity or filter if needed.
     `----
  help: Consider removing this declaration.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchInitialData'
    ,-[Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:71:5]
 69 |  useEffect(() => {
 70 |  fetchInitialData();
    :  ^^^^^^^^|^^^^^^^
    :          `-- useEffect uses `fetchInitialData` here
 71 |  }, [userSession]);
    :     ^^^^^^^^^^^^^
 72 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'formData.batch'
    ,-[Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx:91:5]
 87 |  setFormData(prev => ({ ...prev, batch: uniqueBatches[0] }));
 88 |  } else if (!uniqueBatches.includes(formData.batch)) {
    :                                     ^^^^|^^^
    :                                         `-- useEffect uses `formData.batch` here
 89 |  setFormData(prev => ({ ...prev, batch: "" }));
 90 |  }
 91 |  }, [formData.subject_id, facultySchedule]);
    :     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 92 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminMentorship/MentorshipTransfers.jsx:5:45]
 4 | 
 5 | export default function MentorshipTransfers({}) {
   :                                             ^^
 6 |  const [mentors, setMentors] = useState([]);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  x Expected a semicolon or an implicit semicolon after a statement, but found none
     ,-[Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx:392:22]
 391 |  return (
 392 |     <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
     :                      ^
 393 |         <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
     `----
  help: Try inserting a semicolon here

  ! eslint(no-unused-vars): Identifier 'WeeklyChart' is imported but never used.
   ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:8:8]
 7 | import { Badge } from "../../ui/Badge";
 8 | import WeeklyChart from "../../shared/WeeklyChart";
   :        ^^^^^|^^^^^
   :             `-- 'WeeklyChart' is imported here
 9 | import WeeklyList from "../../shared/WeeklyList";
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'SubjectFlipCard' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:10:8]
  9 | import WeeklyList from "../../shared/WeeklyList";
 10 | import SubjectFlipCard from "../../shared/SubjectFlipCard";
    :        ^^^^^^^|^^^^^^^
    :               `-- 'SubjectFlipCard' is imported here
 11 | 
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'currentTime' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:27:9]
 26 |  const [selectedLecture, setSelectedLecture] = useState(null);
 27 |  const [currentTime, setCurrentTime] = useState(new Date());
    :         ^^^^^|^^^^^
    :              `-- 'currentTime' is declared here
 28 |  const [requestType, setRequestType] = useState('Extra Class');
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'daysMap' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:67:8]
 66 | 
 67 |  const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
    :        ^^^|^^^
    :           `-- 'daysMap' is declared here
 68 |  const nowTime = new Date();
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'isEmbedded' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:320:30]
 319 | 
 320 |  const LectureSideSheet = ({ isEmbedded = false }) => {
     :                              ^^^^^|^^^^
     :                                   `-- 'isEmbedded' is declared here
 321 |  if (!selectedLecture) return null;
     `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchData'
     ,-[Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx:130:5]
 128 |  useEffect(() => {
 129 |  fetchData();
     :  ^^^^|^^^^
     :      `-- useEffect uses `fetchData` here
 130 |  }, [userSession?.id]);
     :     ^^^^^^^^^^^^^^^^^
 131 | 
     `----
  help: Either include it or remove the dependency array.

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   ,-[Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx:6:14]
 5 | 
 6 | export const ADMIN_NAV_GROUPS = [
   :              ^^^^^^^^^^^^^^^^
 7 |   {
   `----

  ! react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
    ,-[Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx:76:14]
 75 | 
 76 | export const ADMIN_NAV_MEGA = [
    :              ^^^^^^^^^^^^^^
 77 |   {
    `----

  ! eslint(no-unused-vars): Variable 'daysMap' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx:102:8]
 101 |  
 102 |  const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };
     :        ^^^|^^^
     :           `-- 'daysMap' is declared here
 103 |  
     `----
  help: Consider removing this declaration.

  ! eslint(no-empty-pattern): Empty object binding pattern
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx:10:41]
  9 | 
 10 | export default function ScheduleBuilder({}) {
    :                                         ^^
 11 |  const [schedule, setSchedule] = useState([]);
    `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchData'
     ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx:125:5]
 123 |  useEffect(() => {
 124 |  fetchData();
     :  ^^^^|^^^^
     :      `-- useEffect uses `fetchData` here
 125 |  }, [selectedBatch]);
     :     ^^^^^^^^^^^^^^^
 126 | 
     `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchLeaves'
    ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeLeaves.jsx:11:8]
  9 |     useEffect(() => {
 10 |         if(menteeId) fetchLeaves();
    :                      ^^^^^|^^^^^
    :                           `-- useEffect uses `fetchLeaves` here
 11 |     }, [menteeId]);
    :        ^^^^^^^^^^
 12 | 
    `----
  help: Either include it or remove the dependency array.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchData'
    ,-[Frontend/ERP/components/Faculty/Approvals/Approvals.jsx:29:5]
 27 |  useEffect(() => {
 28 |  fetchData();
    :  ^^^^|^^^^
    :      `-- useEffect uses `fetchData` here
 29 |  }, []);
    :     ^^
 30 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Parameter 'attendanceRecords' is declared but never used. Unused parameters should start with a '_'.
   ,-[Frontend/ERP/components/Faculty/FacultyAttendance/SwipeableRosterDeck.jsx:5:57]
 4 | 
 5 | export default function SwipeableRosterDeck({ students, attendanceRecords, onMarkAttendance }) {
   :                                                         ^^^^^^^^|^^^^^^^^
   :                                                                 `-- 'attendanceRecords' is declared here
 6 |     const [currentIndex, setCurrentIndex] = useState(0);
   `----
  help: Consider removing this parameter.

  x Expected a semicolon or an implicit semicolon after a statement, but found none
     ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx:176:65]
 175 |                                                     onChange={e => handleAssign(master.id, e.target.value)}
 176 |                                                     className={`w-full max-w-[250px] border rounded-lg px-3 py-2 text-sm font-bold outline-none appearance-none transition ${currentFaculty ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-black border-themeBorder dark:border-white/10 text-themeText dark:text-white'}`}
     :                                                                 ^
 177 |                                                 >
     `----
  help: Try inserting a semicolon here

  ! eslint(no-unused-vars): Identifier 'generatePDF' is imported but never used.
   ,-[Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:8:10]
 7 | import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
 8 | import { generatePDF } from "../../../DocumentTemplates/pdfGenerator";
   :          ^^^^^|^^^^^
   :               `-- 'generatePDF' is imported here
 9 | 
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'getBatchColorKey' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:12:7]
 11 | 
 12 | const getBatchColorKey = (batchName) => {
    :       ^^^^^^^^|^^^^^^^
    :               `-- 'getBatchColorKey' is declared here
 13 |     if (!batchName) return 'default';
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'THEME_COLORS' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:22:7]
 21 | 
 22 | const THEME_COLORS = {
    :       ^^^^^^|^^^^^
    :             `-- 'THEME_COLORS' is declared here
 23 |     blue: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'handleClassChange' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:73:8]
 72 |  // --- DATA SYNC ENGINE ---
 73 |  const handleClassChange = (e) => {
    :        ^^^^^^^^|^^^^^^^^
    :                `-- 'handleClassChange' is declared here
 74 |  const newClass = e.target.value;
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'sesError' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/ClassRoster/ClassRoster.jsx:234:37]
 233 |         
 234 |         let { data: session, error: sesError } = await supabase
     :                                     ^^^^|^^^
     :                                         `-- 'sesError' is declared here
 235 |             .from('class_sessions')
     `----
  help: Consider removing this declaration.

  x Expected a semicolon or an implicit semicolon after a statement, but found none
     ,-[Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx:530:4]
 529 |  ...prev,
 530 |  [`${selectedPage}::${selectedSection}`]: newData
     :    ^
 531 |  }));
     `----
  help: Try inserting a semicolon here

  ! eslint(no-unused-vars): Variable 'loading' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/BatchManager.jsx:22:12]
 21 |     const [batches, setBatches] = useState([]);
 22 |     const [loading, setLoading] = useState(true);
    :            ^^^|^^^
    :               `-- 'loading' is declared here
 23 | 
    `----
  help: Consider removing this declaration.

  x Unterminated string
     ,-[Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyEditorModal.jsx:215:117]
 214 |      onSave();
 215 | ,->  } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }`);
 216 | |    } finally {
 217 | |    setSaving(false);
 218 | |    }
 219 | |    };
 220 | |   
 221 | |    if (loading) {
 222 | |    return createPortal(
 223 | |    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
 224 | |    <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-3xl flex flex-col items-center">
 225 | |    <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin mb-4"></div>
 226 | |    <p className="text-[14px] font-medium tracking-normal text-themeTextSec">Loading Profile Data...</p>
 227 | |    </div>
 228 | |    </div>,
 229 | |    document.body
 230 | |    );
 231 | |    }
 232 | |   
 233 | |    return createPortal(
 234 | |    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
 235 | |    <div className="bg-[#fcfcfc] w-full max-w-4xl rounded-[2rem] flex flex-col max-h-[90vh] overflow-hidden border border-black/10 dark:border-white/20">
 236 | |    
 237 | |    {/* HEADER */}
 238 | |    <div className="bg-themePanel/85 backdrop-blur-2xl px-8 py-6 relative shrink-0 border-b border-black/5 dark:border-white/10 flex justify-between items-center z-10">
 239 | |    <div className="flex items-center gap-4">
 240 | |    <div className="w-12 h-12 rounded-2xl bg-themeAccent/10 flex items-center justify-center">
 241 | |    <i className="fa-solid fa-user-pen text-themeAccent text-xl"></i>
 242 | |    </div>
 243 | |    <div>
 244 | |    <h3 className="text-xl font-semibold tracking-tight text-themeText tracking-tight">Edit Faculty Profile</h3>
 245 | |    <div className="flex items-center gap-4 mt-1">
 246 | |      <p className="text-[13px] font-medium text-themeTextSec">Manage public identity and details</p>
 247 | |      <label className="flex items-center gap-2 cursor-pointer bg-themeElevated/50 px-3 py-1 rounded-full border border-black/5 dark:border-white/10">
 248 | |        <input 
 249 | |          type="checkbox" 
 250 | |          name="is_public" 
 251 | |          checked={formData.is_public} 
 252 | |          onChange={handleInputChange}
 253 | |          className="w-4 h-4 rounded text-themeAccent bg-transparent border-themeBorder focus:ring-themeAccent focus:ring-offset-themePanel"
 254 | |        />
 255 | |        <span className="text-[12px] font-bold text-themeText">Show on Public Website</span>
 256 | |      </label>
 257 | |    </div>
 258 | |    </div>
 259 | |    </div>
 260 | |    <button aria-label="Action button" type="button" onClick={onClose} className="w-10 h-10 bg-black/5 dark:bg-black/40 hover:bg-black/10 dark:hover:bg-white/10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec  transition-colors active:scale-95"><i className="fa-solid fa-xmark text-base"></i></button>
 261 | |    </div>
 262 | |   
 263 | |    {/* SCROLLABLE CONTENT */}
 264 | |    <div className="overflow-y-auto flex-1 bg-black/5 dark:bg-black/40 no-scrollbar p-8">
 265 | |    <form id="faculty-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
 266 | |    
 267 | |    {/* PHOTO SECTION */}
 268 | |    <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-[1.5rem] border border-black/5 dark:border-white/10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
 269 | |    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-themeAccent to-themeAccent/20"></div>
 270 | |    
 271 | |    <div className="flex-1 w-full flex flex-col">
 272 | |    <h4 className="text-[15px] font-semibold text-themeText tracking-normal mb-4 flex items-center gap-2">
 273 | |    <i className="fa-solid fa-camera text-themeAccent"></i> Profile Photo
 274 | |    </h4>
 275 | |    
 276 | |    <div className="flex gap-3 mb-6">
 277 | |    <div className="relative overflow-hidden group">
 278 | |    <input type="file" accept="image/*" onChange={onSelectFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
 279 | |    <div className="bg-themeAccent text-themeText px-5 py-2.5 rounded-xl text-[14px] font-bold tracking-normal transition group-hover:bg-themeAccent/90 flex items-center gap-2 pointer-events-none">
 280 | |    <i className="fa-solid fa-upload"></i> Upload New
 281 | |    </div>
 282 | |    </div>
 283 | |    <button 
 284 | |    type="button" 
 285 | |    onClick={loadCurrentPhotoForCrop}
 286 | |    className="bg-themeElevated hover:bg-themeElevated/80 border border-black/5 dark:border-white/10 text-themeText px-5 py-2.5 rounded-xl text-[14px] font-bold tracking-normal transition flex items-center gap-2"
 287 | |    >
 288 | |    <i className="fa-solid fa-crop-simple"></i> Adjust Current
 289 | |    </button>
 290 | |    </div>
 291 | |    
 292 | |    {imgSrc && (
 293 | |    <div className="mt-2 border-2 border-dashed border-black/5 dark:border-white/10 rounded-2xl overflow-hidden flex justify-center bg-black/5 dark:bg-black/40 p-4 max-h-72">
 294 | |    <ReactCrop
 295 | |    crop={crop}
 296 | |    onChange={(_, percentCrop) => setCrop(percentCrop)}
 297 | |    onComplete={(c) => setCompletedCrop(c)}
 298 | |    aspect={1}
 299 | |    circularCrop
 300 | |    >
 301 | |    <img ref={imgRef} src={imgSrc} alt="Crop me" onLoad={onImageLoad} style={{ maxHeight: '256px', borderRadius: '8px' }} />
 302 | |    </ReactCrop>
 303 | |    </div>
 304 | |    )}
 305 | |    </div>
 306 | |    
 307 | |    <div className="shrink-0 flex flex-col items-center gap-3 bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-black/5 dark:border-white/10">
 308 | |    <p className="text-[13px] font-medium text-neutral-400">Current Display</p>
 309 | |    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-themeBorder hover:bg-white/10 border border-themeBorder dark:border-white/10">
 310 | |    <img src={formData.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-cover" alt="Current" />
 311 | |    </div>
 312 | |    </div>
 313 | |    </div>
 314 | |   
 315 | |    {/* DETAILS SECTION */}
 316 | |    <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-[1.5rem] border border-black/5 dark:border-white/10 flex flex-col gap-6 relative overflow-hidden">
 317 | |    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 to-transparent"></div>
 318 | |    
 319 | |    <h4 className="text-[15px] font-semibold text-themeText tracking-normal mb-2 flex items-center gap-2">
 320 | |    <i className="fa-solid fa-address-card text-neutral-400"></i> Identity & Contact
 321 | |    </h4>
 322 | |   
 323 | |    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
 324 | |    <div className="md:col-span-2">
 325 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Bio / Introduction</label>
 326 | |    <textarea 
 327 | |    name="bio" 
 328 | |    value={formData.bio} 
 329 | |    onChange={handleInputChange} 
 330 | |    rows={3}
 331 | |    placeholder="A brief overview of the faculty member..."
 332 | |    className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-medium focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition resize-y" 
 333 | |    />
 334 | |    </div>
 335 | |    <div>
 336 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Full Name</label>
 337 | |    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 338 | |    </div>
 339 | |    <div>
 340 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Department</label>
 341 | |    <input type="text" name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 342 | |    </div>
 343 | |    <div>
 344 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Designation</label>
 345 | |    <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 346 | |    </div>
 347 | |    <div>
 348 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Specialisation</label>
 349 | |    <input type="text" name="specialisation" value={formData.specialisation} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 350 | |    </div>
 351 | |    <div className="md:col-span-2">
 352 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Degrees</label>
 353 | |    <input type="text" name="degrees" value={formData.degrees} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 354 | |    </div>
 355 | |    <div>
 356 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Office Address</label>
 357 | |    <input type="text" name="office_address" value={formData.office_address} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 358 | |    </div>
 359 | |    <div>
 360 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Phone Number</label>
 361 | |    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 362 | |    </div>
 363 | |    <div>
 364 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">LinkedIn URL</label>
 365 | |    <input type="text" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 366 | |    </div>
 367 | |    <div>
 368 | |    <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec">Google Scholar URL</label>
 369 | |    <input type="text" name="scholar_url" value={formData.scholar_url} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 370 | |    </div>
 371 | |    <div className="md:col-span-2 flex items-center gap-3 bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-4 rounded-xl mt-2">
 372 | |       <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} className="w-5 h-5 rounded accent-themeAccent cursor-pointer" id="is_public_toggle" />
 373 | |       <label htmlFor="is_public_toggle" className="text-sm font-bold text-themeText cursor-pointer select-none">
 374 | |           Publish to Website Directory
 375 | |           <p className="text-[10px] text-themeTextSec font-medium mt-0.5 normal-case">If disabled, this faculty member will be hidden from the public website.</p>
 376 | |       </label>
 377 | |    </div>
 378 | |   
 379 | |    </div>
 380 | |    </div>
 381 | |    </form>
 382 | |    </div>
 383 | |   
 384 | |    {/* FOOTER */}
 385 | |    <div className="bg-themePanel/85 backdrop-blur-2xl p-6 border-t border-black/5 dark:border-white/10 flex justify-end shrink-0 gap-4 z-10">
 386 | |    <button type="button" onClick={onClose} disabled={saving} className="px-8 py-3 rounded-xl font-black tracking-normal text-[10px] text-themeTextSec bg-neutral-100 hover:bg-themeBorder hover:bg-white/10 border border-themeBorder dark:border-white/10 hover:text-themeText transition disabled:cursor-not-allowed">
 387 | |    Cancel
 388 | |    </button>
 389 | |    <button form="faculty-edit-form" type="submit" disabled={saving} className="bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white px-10 py-3 rounded-xl font-black tracking-normal text-[10px] transition hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 disabled:cursor-not-allowed">
 390 | |    {saving ? (
 391 | |    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Saving Changes...</>
 392 | |    ) : (
 393 | |    <><i className="fa-solid fa-save text-sm"></i> Save Profile</>
 394 | |    )}
 395 | |    </button>
 396 | |    </div>
 397 | |    </div>
 398 | |    </div>,
 399 | |    document.body
 400 | |    );
 401 | `-> }
     `----

  x Unexpected token
    ,-[Frontend/ERP/components/Faculty/FacultyMentorship/FacultyStudentProfile360.jsx:31:3]
 30 |  fetchAnalytics();
 31 |  }, [mentee]);
    :   ^
 32 | 
    `----

  ! eslint(no-unused-vars): Catch parameter 'error' is caught but never used.
    ,-[Frontend/ERP/components/Student/Mentorship/Mentorship.jsx:90:18]
 89 |             }, 1500);
 90 |         } catch (error) {
    :                  ^^|^^
    :                    `-- 'error' is declared here
 91 |             setStatusMessage({ type: "error", text: "Failed to request session." });
    `----
  help: Consider handling this error.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchData'
    ,-[Frontend/ERP/components/Student/Mentorship/Mentorship.jsx:59:8]
 57 |     useEffect(() => {
 58 |         if (studentId) fetchData();
    :                        ^^^^|^^^^
    :                            `-- useEffect uses `fetchData` here
 59 |     }, [studentId]);
    :        ^^^^^^^^^^^
 60 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'sendSystemEmail' is imported but never used.
   ,-[Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:5:10]
 4 | import { useERP } from "../../../context/ErpContext";
 5 | import { sendSystemEmail } from '../../../lib/EmailService';
   :          ^^^^^^^|^^^^^^^
   :                 `-- 'sendSystemEmail' is imported here
 6 | import { createClient } from '@supabase/supabase-js';
   `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'userSession' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:18:10]
 17 | export default function AdminFacultyDirectory({ isEmbedded = false,  isHubView = false }) {
 18 |  const { userSession } = useERP();
    :          ^^^^^|^^^^^
    :               `-- 'userSession' is declared here
 19 |  const [faculties, setFaculties] = useState([]);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'highestIdError' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:90:38]
 89 |  // 1. Generate sequential ERP ID
 90 |  const { data: highestIdData, error: highestIdError } = await supabase
    :                                      ^^^^^^^|^^^^^^
    :                                             `-- 'highestIdError' is declared here
 91 |  .from('profiles')
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Catch parameter 'err' is caught but never used.
     ,-[Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx:189:11]
 188 |  fetchDirectory();
 189 |  } catch (err) {
     :           ^|^
     :            `-- 'err' is declared here
 190 |  window.erpDialog?.alert('Failed to update visibility');
     `----
  help: Consider handling this error.

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchInternships'
    ,-[Frontend/ERP/components/Faculty/FacultyMentorship/MenteeInternships.jsx:12:8]
 10 |     useEffect(() => {
 11 |         fetchInternships();
    :         ^^^^^^^^|^^^^^^^
    :                 `-- useEffect uses `fetchInternships` here
 12 |     }, [menteeId]);
    :        ^^^^^^^^^^
 13 | 
    `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Identifier 'motion' is imported but never used.
   ,-[Frontend/ERP/components/Student/StudentCareerHub/StudentCareerHub.jsx:2:10]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import { motion } from 'framer-motion';
   :          ^^^|^^
   :             `-- 'motion' is imported here
 3 | import React, { useState } from "react";
   `----
  help: Consider removing this import.

  ! eslint(no-empty-pattern): Empty object binding pattern
   ,-[Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/SemesterManager.jsx:5:41]
 4 | 
 5 | export default function SemesterManager({}) {
   :                                         ^^
 6 |  const [semesters, setSemesters] = useState([]);
   `----
  help: Passing `null` or `undefined` will result in runtime error because `null` and `undefined` cannot be destructured.

  ! eslint(no-unused-vars): Catch parameter 'e' is caught but never used.
    ,-[Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx:74:11]
 73 |  workload = count || 0;
 74 |  } catch (e) {
    :           |
    :           `-- 'e' is declared here
 75 |  // ignore if class_schedule doesn't exist
    `----
  help: Consider handling this error.

  ! eslint(no-unused-vars): Identifier 'useRef' is imported but never used.
   ,-[Frontend/ERP/components/Student/Internships/Internships.jsx:2:51]
 1 | /* © 2026 JSM VALOR. All Rights Reserved. */
 2 | import React, { useState, useEffect, useCallback, useRef } from "react";
   :                                                   ^^^|^^
   :                                                      `-- 'useRef' is imported here
 3 | import { theme } from '../../../../Shared/theme';
   `----
  help: Consider removing this import.

  x Unterminated string
     ,-[Frontend/ERP/components/Student/Notices/FacultyBroadcastForm.jsx:51:117]
  50 |      if (onNoticePublished) onNoticePublished();
  51 | ,->  } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }`);
  52 | |    } finally {
  53 | |    setIsPublishing(false);
  54 | |    }
  55 | |    };
  56 | |   
  57 | |    return (
  58 | |    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in relative flex flex-col h-full">
  59 | |    <div className="p-6 lg:p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-start bg-white/50 dark:bg-black/10 backdrop-blur-xl relative z-10 shrink-0">
  60 | |    <div>
  61 | |    <h2 className="text-xl lg:text-2xl font-black tracking-tight text-themeText dark:text-white mb-1">{userSession?.role === "admin" ? "Administrative Broadcast" : "Faculty Broadcast"}</h2>
  62 | |    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">Send official notices directly to assigned batches or students.</p>
  63 | |    </div>
  64 | |    <button aria-label="Action button" type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/10 transition-colors shrink-0"><i className="fa-solid fa-xmark"></i></button>
  65 | |    </div>
  66 | |   
  67 | |    <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
  68 | |    <form id="faculty-broadcast-form" onSubmit={handlePublish} className="flex flex-col gap-6 max-w-3xl mx-auto">
  69 | |    
  70 | |    <div>
  71 | |    <TargetAudienceSelector value={targetAudience} onChange={setTargetAudience} role={userSession?.role || "faculty"} />
  72 | |    </div>
  73 | |   
  74 | |    <div>
  75 | |    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Notice Title</label>
  76 | |    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-blue-500 outline-none transition" placeholder="e.g. Rescheduling Tomorrow's Lecture" />
  77 | |    </div>
  78 | |    
  79 | |    <div className="grid grid-cols-2 gap-4">
  80 | |    <div>
  81 | |    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Category</label>
  82 | |    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-blue-500 outline-none appearance-none transition">
  83 | |    <option value="Academic">Academic</option>
  84 | |    <option value="Assignment">Assignment</option>
  85 | |    <option value="Examination">Examination</option>
  86 | |    <option value="General">General</option>
  87 | |    </select>
  88 | |    </div>
  89 | |    <div>
  90 | |    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Priority</label>
  91 | |    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-blue-500 outline-none appearance-none transition">
  92 | |    <option value="normal">Normal</option>
  93 | |    <option value="high">High</option>
  94 | |    <option value="urgent">Urgent</option>
  95 | |    </select>
  96 | |    </div>
  97 | |    </div>
  98 | |    
  99 | |    <div>
 100 | |    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Content</label>
 101 | |    <textarea value={content} onChange={e => setContent(e.target.value)} required rows="6" className="w-full bg-gray-100 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-medium text-themeText dark:text-white focus:border-blue-500 outline-none resize-none transition shadow-inner" placeholder="Draft your message here..."></textarea>
 102 | |    </div>
 103 | |    
 104 | |    <label className="flex items-center gap-4 p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-colors">
 105 | |    <input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded border-black/10" />
 106 | |    <div>
 107 | |    <span className="text-sm font-black tracking-tight text-themeText dark:text-white block mb-0.5">Require Digital Acknowledgement</span>
 108 | |    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70">Forces students to sign upon reading. (Feature flagged)</span>
 109 | |    </div>
 110 | |    </label>
 111 | |   
 112 | |    </form>
 113 | |    </div>
 114 | |   
 115 | |    <div className="p-6 lg:p-8 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/10 backdrop-blur-xl flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
 116 | |    <button type="button" onClick={onCancel} className="px-6 py-3.5 rounded-xl text-sm font-bold text-themeTextSec dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-themeText dark:hover:text-white transition">
 117 | |    Cancel
 118 | |    </button>
 119 | |    <button type="submit" form="faculty-broadcast-form" disabled={isPublishing} className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-xl shadow-blue-500/20 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
 120 | |    {isPublishing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
 121 | |    {isPublishing ? 'Broadcasting...' : 'Broadcast Notice'}
 122 | |    </button>
 123 | |    </div>
 124 | |    </div>
 125 | |    );
 126 | `-> }
     `----

  ! react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'fetchData'
     ,-[Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx:163:8]
 161 |     useEffect(() => {
 162 |         if (facultyId) fetchData();
     :                        ^^^^|^^^^
     :                            `-- useEffect uses `fetchData` here
 163 |     }, [facultyId]);
     :        ^^^^^^^^^^^
 164 | 
     `----
  help: Either include it or remove the dependency array.

  ! eslint(no-unused-vars): Variable 'rpcData' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Admin/UserManagement/AdminPasswordResetsModal.jsx:56:16]
 55 |  // 3. Update the password using the secure RPC
 56 |  const { data: rpcData, error: rpcError } = await supabase.rpc('admin_force_password_update', {
    :                ^^^|^^^
    :                   `-- 'rpcData' is declared here
 57 |  target_user_id: user.id,
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'loading' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Student/Notices/Notices.jsx:13:12]
 12 |     const [notices, setNotices] = useState([]);
 13 |     const [loading, setLoading] = useState(true);
    :            ^^^|^^^
    :               `-- 'loading' is declared here
 14 |     const [selectedNotice, setSelectedNotice] = useState(null);
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'renderEventsFeed' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Student/Notices/Notices.jsx:232:11]
 231 | 
 232 |     const renderEventsFeed = () => (
     :           ^^^^^^^^|^^^^^^^
     :                   `-- 'renderEventsFeed' is declared here
 233 |         <div className="flex flex-col gap-4 pb-12">
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'config' is declared but never used. Unused parameters should start with a '_'.
    ,-[Frontend/ERP/components/Admin/UserManagement/AdminStudentCVModal.jsx:70:31]
 69 | 
 70 | const ModernTemplate = (data, config) => {
    :                               ^^^|^^
    :                                  `-- 'config' is declared here
 71 |  const HS = { color: "#d97706" };
    `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Identifier 'theme' is imported but never used.
   ,-[Frontend/ERP/components/Student/CourseVault/CourseVault.jsx:6:10]
 5 | import { useERP } from "../../../context/ErpContext";
 6 | import { theme } from '../../../../Shared/theme';
   :          ^^|^^
   :            `-- 'theme' is imported here
 7 | import PageHeader from "../../shared/PageHeader/PageHeader";
   `----
  help: Consider removing this import.

  ! eslint(no-unreachable): Unreachable code.
     ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:710:13]
 709 |                 
 710 | ,->             try {
 711 | |                   const facultyId = userSession?.db_id;
 712 | |                   if (!facultyId) return;
 713 | |   
 714 | |                   
 715 | |                   // Get valid subjects for LLB 102 and 103
 716 | |                   const { data: subjects } = await supabase.from('master_subjects').select('id, code').ilike('code', '%LLB 10%');
 717 | |                   if (!subjects || subjects.length === 0) return;
 718 | |                   
 719 | |                   const sub1 = subjects.find(s => s.code.includes('102'));
 720 | |                   const sub2 = subjects.find(s => s.code.includes('103'));
 721 | |                   const sub3 = subjects.find(s => s.code.includes('104'));
 722 | |                   
 723 | |                   if(!sub1) return;
 724 | |   
 725 | |                   // 1. Get batch IDs for LLB Class of 2029
 726 | |                   const { data: batches } = await supabase.from('academic_batches').select('id').ilike('name', '%LLB (Class of 2029)%').limit(1);
 727 | |                   const batchId = batches?.[0]?.id;
 728 | |                   
 729 | |                   if (batchId) {
 730 | |                       // Try to insert cohorts
 731 | |                       await supabase.from('cohort_subjects').insert([
 732 | |                           { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub1.id },
 733 | |                           { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub2?.id || sub1.id },
 734 | |                           { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub3?.id || sub1.id }
 735 | |                       ]);
 736 | |                   }
 737 | |   
 738 | |                   // 2. Insert schedules
 739 | |                   const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
 740 | |                   const roomId = rooms?.[0]?.id;
 741 | |                   
 742 | |                   const schedules = [
 743 | |                       { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section I', day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
 744 | |                       { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section I', day_of_week: 'Friday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
 745 | |                       { faculty_id: facultyId, subject_id: sub2?.id || sub1.id, batch: 'LLB Section I', day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
 746 | |                       
 747 | |                       { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section II', day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
 748 | |                       { faculty_id: facultyId, subject_id: sub2?.id || sub1.id, batch: 'LLB Section II', day_of_week: 'Thursday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
 749 | |                       { faculty_id: facultyId, subject_id: sub3?.id || sub1.id, batch: 'LLB Section II', day_of_week: 'Friday', start_time: '11:00:00', end_time: '12:00:00', status: 'Scheduled', room_id: roomId },
 750 | |                   ];
 751 | |                   
 752 | |                   const { data: insSch } = await supabase.from('class_schedule').insert(schedules).select();
 753 | |                   
 754 | |                   if (insSch && insSch.length > 0) {
 755 | |                       // 3. Generate sessions from Aug 17
 756 | |                       const start = new Date("2026-08-17T00:00:00Z");
 757 | |                       const end = new Date(); // Up to today
 758 | |                       const dayMap = { 'Sunday':0, 'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6 };
 759 | |                       
 760 | |                       let sessionsToInsert = [];
 761 | |                       for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
 762 | |                           const dayInt = d.getDay();
 763 | |                           insSch.forEach(sch => {
 764 | |                               if (dayMap[sch.day_of_week] === dayInt) {
 765 | |                                   const dateStr = getLocalDateString(d);
 766 | |                                   sessionsToInsert.push({
 767 | |                                       schedule_id: sch.id,
 768 | |                                       faculty_id: facultyId,
 769 | |                                       date: dateStr,
 770 | |                                       status: 'completed',
 771 | |                                       started_at: new Date(`${dateStr}T${sch.start_time}Z`).toISOString(),
 772 | |                                       ended_at: new Date(`${dateStr}T${sch.end_time}Z`).toISOString(),
 773 | |                                       present_count: 0,
 774 | |                                       total_students: 0
 775 | |                                   });
 776 | |                               }
 777 | |                           });
 778 | |                       }
 779 | |                       
 780 | |                       await supabase.from('class_sessions').insert(sessionsToInsert);
 781 | |                       
 782 | |                       // Wire students to Section I and II
 783 | |                       const { data: students } = await supabase.from('profiles').select('id, full_name').eq('role', 'student');
 784 | |                       if (students && students.length > 0) {
 785 | |                           for(let i=0; i<students.length; i++) {
 786 | |                               await supabase.from('profiles').update({ academic_batch: (i % 2 === 0) ? 'LLB Section I' : 'LLB Section II' }).eq('id', students[i].id);
 787 | |                           }
 788 | |                       }
 789 | |                       
 790 | |                       localStorage.setItem('wired_dataset_aug_17_v2', 'true');
 791 | |                       window.location.reload();
 792 | |                   }
 793 | `->             } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 794 |             };
     `----
  help: Remove the unreachable code or fix the control flow to make it reachable.

  ! eslint(no-unused-vars): Identifier 'GlassSurface' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:9:10]
  8 | import { CheckmarkBadge01Icon, Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons';
  9 | import { GlassSurface } from "../../ui/GlassSurface";
    :          ^^^^^^|^^^^^
    :                `-- 'GlassSurface' is imported here
 10 | import { Badge } from "../../ui/Badge";
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Identifier 'Badge' is imported but never used.
    ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:10:10]
  9 | import { GlassSurface } from "../../ui/GlassSurface";
 10 | import { Badge } from "../../ui/Badge";
    :          ^^|^^
    :            `-- 'Badge' is imported here
 11 | import { useERP } from "../../../context/ErpContext";
    `----
  help: Consider removing this import.

  ! eslint(no-unused-vars): Variable 'DAYS' is declared but never used. Unused variables should start with a '_'.
    ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:56:8]
 55 | 
 56 |  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    :        ^^|^
    :          `-- 'DAYS' is declared here
 57 | 
    `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'masterIds' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:111:19]
 110 |             // Fetch schedules and basic sessions for unmarked calculation
 111 |             const masterIds = cohortSubs.map(c => c.master_subjects?.id).filter(Boolean);
     :                   ^^^^|^^^^
     :                       `-- 'masterIds' is declared here
 112 |             // Fix: class_schedule.batch is a string name, cohort_subjects.batch_id is a UUID. 
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Variable 'todayLen' is declared but never used. Unused variables should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:196:19]
 195 |             const cachedToday = sessionStorage.getItem(`fac_todayClasses_${userSession?.db_id}`);
 196 |             const todayLen = cachedToday ? JSON.parse(cachedToday).length : 0;
     :                   ^^^^|^^^
     :                       `-- 'todayLen' is declared here
 197 |             // if (todayLen === 0 && !activeSession) setActiveTab('analytics');
     `----
  help: Consider removing this declaration.

  ! eslint(no-unused-vars): Parameter 'e' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:584:46]
 583 |                                         portal_link: window.location.origin + '/login'
 584 |                                     }).catch(e => {});
     :                                              |
     :                                              `-- 'e' is declared here
 585 |                                     if (parent.phone) {
     `----
  help: Consider removing this parameter.

  ! eslint(no-unused-vars): Parameter 'e' is declared but never used. Unused parameters should start with a '_'.
     ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:586:273]
 585 |                                     if (parent.phone) {
 586 |                                         sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj.full_name} has been marked ABSENT for ${activeSession.subject || 'Class'} on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`).catch(e => {});
     :                                                                                                                                                                                                                                                                                 |
     :                                                                                                                                                                                                                                                                                 `-- 'e' is declared here
 587 |                                     }
     `----
  help: Consider removing this parameter.

  ! react-hooks(exhaustive-deps): React Hook useEffect has missing dependencies: 'fetchAllSubjects', and 'fetchTodayClasses'
    ,-[Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx:63:5]
 59 |  if (userSession?.db_id) {
 60 |  fetchTodayClasses();
    :  ^^^^^^^^^^^^^^^^^
 61 |  fetchAllSubjects();
    :  ^^^^^^^^^^^^^^^^
 62 |  }
 63 |  }, [userSession]);
    :     ^^^^^^^^^^^^^
 64 |  
    `----
  help: Either include it or remove the dependency array.

Found 258 warnings and 18 errors.
Finished in 60ms on 262 files with 91 rules using 8 threads.
```
