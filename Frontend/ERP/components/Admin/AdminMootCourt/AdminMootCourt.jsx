/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";
import StatCard from '../../../../Shared/components/UI/StatCard';
import DataTable from '../../../../Shared/components/UI/DataTable';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminMootCourt() {
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, compRes] = await Promise.all([
        supabase.from('moot_court_teams').select('*, moot_court_competitions(title, type), profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('moot_court_competitions').select('*').order('start_date', { ascending: false })
      ]);

      if (teamsRes.error) {
        // If table doesn't exist, Supabase will throw error. 
        // We catch it and just set empty arrays for now, as user runs the SQL script.
        console.warn("Could not fetch teams. Has the SQL script been executed?", teamsRes.error.message);
      } else {
        setTeams(teamsRes.data || []);
      }
      if (!compRes.error) {
        setCompetitions(compRes.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTeamsCount = teams.filter(t => t.status === 'Active').length;
  const upcomingCompsCount = competitions.filter(c => c.status === 'Upcoming').length;
  const nextComp = competitions.find(c => c.status === 'Upcoming')?.title || "None scheduled";
  const avgScore = teams.reduce((acc, curr) => acc + (Number(curr.memorial_score) || 0), 0) / (teams.filter(t => t.memorial_score).length || 1);

  const teamColumns = [
    { key: 'team_code', label: 'Team Code', render: (row) => <span className="font-bold">{row.team_code}</span> },
    { key: 'competition', label: 'Competition', render: (row) => row.moot_court_competitions?.title || 'Unknown' },
    { key: 'type', label: 'Type', render: (row) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.moot_court_competitions?.type === 'Internal' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
          {row.moot_court_competitions?.type || 'N/A'}
        </span>
    )},
    { key: 'mentor', label: 'Faculty Mentor', render: (row) => row.profiles?.full_name || 'Unassigned' },
    { key: 'score', label: 'Memorial Score', render: (row) => row.memorial_score ? `${row.memorial_score} / 100` : 'Pending' },
    { key: 'status', label: 'Status', render: (row) => {
        const color = row.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' : 
                      row.status === 'Eliminated' ? 'text-rose-500 bg-rose-500/10' : 
                      row.status === 'Winner' ? 'text-amber-500 bg-amber-500/10' : 'text-indigo-500 bg-indigo-500/10';
        return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${color}`}>{row.status}</span>;
    }}
  ];

  return (
    <div className="w-full animate-fade-in selection:bg-themeAccent/20 text-themeText">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Teams" 
          value={activeTeamsCount} 
          badgeText="Currently Competing" 
          badgeColor="emerald" 
        />
        <StatCard 
          title="Upcoming Competitions" 
          value={upcomingCompsCount} 
          badgeText={`Next: ${nextComp}`} 
          badgeColor="amber" 
        />
        <StatCard 
          title="Avg Memorial Score" 
          value={avgScore > 0 ? avgScore.toFixed(1) : "N/A"} 
          badgeText="Internal & External" 
          badgeColor="indigo" 
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black">Registered Teams</h2>
        <button onClick={() => window.erpToast && window.erpToast.show("Registration form coming soon.", "info")} className="bg-themeAccent text-themeApp px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
          <i className="fa-solid fa-plus mr-2"></i> Register Team
        </button>
      </div>

      <DataTable 
        columns={teamColumns} 
        data={teams} 
        isLoading={isLoading} 
        emptyMessage="No Moot Court Teams found. They will appear here once registered." 
      />
    </div>
  );
}
