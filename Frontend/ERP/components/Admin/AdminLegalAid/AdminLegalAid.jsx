/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";
import StatCard from '../../../../Shared/components/UI/StatCard';
import DataTable from '../../../../Shared/components/UI/DataTable';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminLegalAid() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('legal_aid_cases')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Could not fetch cases. Has the SQL script been executed?", error.message);
      } else {
        setCases(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCasesCount = cases.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  const resolvedCasesCount = cases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const totalHours = cases.reduce((acc, curr) => acc + (Number(curr.pro_bono_hours) || 0), 0);

  const caseColumns = [
    { key: 'case_number', label: 'Case Number', render: (row) => <span className="font-mono font-bold text-themeAccent">{row.case_number}</span> },
    { key: 'title', label: 'Title / Subject', render: (row) => (
        <div className="flex flex-col">
            <span className="font-bold">{row.title}</span>
            <span className="text-xs text-themeTextSec">Client: {row.client_name}</span>
        </div>
    )},
    { key: 'assigned', label: 'Assigned Supervising Faculty', render: (row) => row.profiles?.full_name || 'Unassigned' },
    { key: 'hours', label: 'Pro-Bono Hours', render: (row) => `${row.pro_bono_hours || 0} hrs` },
    { key: 'status', label: 'Status', render: (row) => {
        const color = row.status === 'Open' ? 'text-indigo-500 bg-indigo-500/10' : 
                      row.status === 'In Progress' ? 'text-amber-500 bg-amber-500/10' : 
                      row.status === 'Resolved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-500 bg-gray-500/10';
        return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${color}`}>{row.status}</span>;
    }}
  ];

  return (
    <div className="w-full animate-fade-in selection:bg-rose-500/20 text-themeText">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Cases" 
          value={activeCasesCount} 
          badgeText="Currently in progress" 
          badgeColor="rose" 
        />
        <StatCard 
          title="Total Pro-Bono Hours" 
          value={totalHours.toFixed(1)} 
          badgeText="Across all cases" 
          badgeColor="amber" 
        />
        <StatCard 
          title="Resolved Cases" 
          value={resolvedCasesCount} 
          badgeText="Successfully Closed" 
          badgeColor="emerald" 
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black">Pro-Bono Case Ledger</h2>
        <button onClick={() => window.erpToast && window.erpToast.show("Intake form coming soon.", "info")} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-rose-600 transition-colors">
          <i className="fa-solid fa-plus mr-2"></i> New Case Intake
        </button>
      </div>

      <DataTable 
        columns={caseColumns} 
        data={cases} 
        isLoading={isLoading} 
        emptyMessage="No Legal Aid cases recorded. The ledger is empty." 
      />
    </div>
  );
}
