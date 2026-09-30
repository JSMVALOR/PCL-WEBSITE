const fs = require('fs');

let file = 'Frontend/ERP/components/Student/Credentials/Credentials.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the return statement and replace it
const renderRegex = /return \([\s\S]*?\);\n\}/;
const match = content.match(renderRegex);

if (match) {
  const newRender = `return (
    <div className="w-full h-full lg:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 lg:gap-8 pb-10 lg:pb-0 animate-fade-in relative max-w-[1600px] mx-auto overflow-hidden text-themeText">
      
      {/* LEFT SIDEBAR: Full Height Profile Image & Info */}
      <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 bg-themePanel border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center shadow-sm relative h-auto lg:h-full overflow-y-auto no-scrollbar">
          {pendingRequest && (
            <div className="w-full mb-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
              <i className="fa-solid fa-hourglass-half text-amber-500 text-2xl"></i>
              <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Update Pending</h4>
            </div>
          )}

          <div className="relative group mb-6">
              <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-themeElevated shadow-xl relative z-10 bg-themeElevated">
                  <img src={getLocalAvatar(profileData)} alt="Profile" className="w-full h-full object-cover" />
              </div>
          </div>
          
          <h2 className="text-xl xl:text-2xl font-black text-themeText tracking-tight leading-tight">{profileData.full_name}</h2>
          <p className="text-[11px] font-bold text-themeTextSec uppercase tracking-widest mt-2">{profileData.role}</p>
          
          <div className="mt-4 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE ACCOUNT
          </div>

          <div className="w-full h-px bg-themeBorder my-6"></div>

          <div className="w-full flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">User ID Number</span>
                  <span className="text-sm font-black text-themeText">{profileData.id_number || 'PENDING'}</span>
              </div>
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">System Email</span>
                  <span className="text-sm font-bold text-themeText break-all">{profileData.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Phone Number</span>
                  <span className="text-sm font-bold text-themeText">{profileData.phone || 'Not Updated'}</span>
              </div>
          </div>

          <div className="mt-auto pt-8 w-full flex flex-col gap-3">
              <button onClick={() => setShowEditModal(true)} className="w-full py-3.5 bg-themeElevated border border-themeBorder text-themeText hover:bg-themeBorder font-bold rounded-xl text-sm transition flex items-center justify-center gap-2">
                  <i className="fa-solid fa-pen-to-square"></i> Edit Profile
              </button>
              <button onClick={(e) => { e.preventDefault(); window.erpDialog?.alert("Development in Progress"); }} className="w-full py-3.5 bg-themeAccent text-white hover:bg-themeAccent/90 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-themeAccent/20">
                  <i className="fa-solid fa-id-badge"></i> Download ID Card
              </button>
          </div>
      </div>

      {/* RIGHT SIDEBAR: Content & Settings Tabs */}
      <div className="flex-1 flex flex-col h-auto lg:h-full overflow-hidden bg-themePanel border border-themeBorder rounded-[2rem] shadow-sm">
          {/* Top Tabs */}
          <div className="flex p-3 gap-2 border-b border-themeBorder bg-themeElevated/30 flex-wrap">
              {['profile', 'security', 'appearance'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={\`flex-1 min-w-[100px] py-3.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition \${activeTab === tab ? 'bg-themePanel text-themeAccent shadow-sm border border-themeBorder' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated'}\`}>
                      {tab === 'profile' ? 'Details' : tab === 'security' ? 'Security' : 'Appearance'}
                  </button>
              ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar relative z-10">
              {activeTab === 'profile' && (
                  <div className="flex flex-col gap-10 animate-fade-in pb-10">
                      <div>
                          <h3 className="text-lg font-black text-themeText mb-6 border-b border-themeBorder pb-3"><i className="fa-regular fa-user mr-2 text-themeTextSec"></i> Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Date of Birth</span>
                                  <span className="text-sm font-bold text-themeText">{profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-GB') : "Not Updated"}</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Gender</span>
                                  <span className="text-sm font-bold text-themeText">{profileData.gender || "Not Updated"}</span>
                              </div>
                              <div className="flex flex-col gap-1.5 md:col-span-2">
                                  <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Permanent Address</span>
                                  <span className="text-sm font-bold text-themeText">{profileData.address || "Not Updated"}</span>
                              </div>
                          </div>
                      </div>

                      {profileData.role === 'student' && (
                          <div>
                              <h3 className="text-lg font-black text-themeText mb-6 border-b border-themeBorder pb-3"><i className="fa-solid fa-graduation-cap mr-2 text-themeTextSec"></i> Academic Profile</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Degree Program</span>
                                      <span className="text-sm font-bold text-themeText">{profileData.academic_programs?.name || "Not Assigned"}</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Current Semester</span>
                                      <span className="text-sm font-bold text-themeText">{profileData.batches?.current_semester || "-"}</span>
                                  </div>
                              </div>
                          </div>
                      )}

                      {profileData.role === 'faculty' && (
                          <div>
                              <h3 className="text-lg font-black text-themeText mb-6 border-b border-themeBorder pb-3"><i className="fa-solid fa-chalkboard-user mr-2 text-themeTextSec"></i> Employment Profile</h3>
                              <div className="grid grid-cols-1 gap-8">
                                  <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Department / Specialization</span>
                                      <span className="text-sm font-bold text-themeText">{profileData.metadata?.department || "Law Faculty"}</span>
                                  </div>
                              </div>
                          </div>
                      )}

                      {profileData.role === 'admin' && (
                          <div>
                              <h3 className="text-lg font-black text-themeText mb-6 border-b border-themeBorder pb-3"><i className="fa-solid fa-shield-halved mr-2 text-themeTextSec"></i> System Clearance</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Account Type</span>
                                      <span className="text-sm font-bold text-themeText">Super Administrator</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Clearance Level</span>
                                      <span className="text-sm font-bold text-emerald-500"><i className="fa-solid fa-lock-open mr-1"></i> Tier 1 (Global)</span>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
      </div>

      {showEditModal && <ProfileEditModal profileData={profileData} onClose={() => setShowEditModal(false)} onUpdate={refreshProfile} />}
    </div>
  );
}`;
  content = content.replace(match[0], newRender);
  fs.writeFileSync(file, content);
}
