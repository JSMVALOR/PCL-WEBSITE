/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import PclLogoSvg from '../components/Shared/Assets/LOGOS/PclLogoSvg';

const numberToWordsIndian = (num) => {
  if (!num) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str;
};

const FeeReceiptTemplate = React.forwardRef(({ invoiceData, studentData }, ref) => {
  if (!invoiceData) return null;

  const amount = Number(invoiceData.amount) || 0;
  const isPaid = invoiceData.status === 'paid' || invoiceData.status === 'successful';

  return (
    <div 
      ref={ref} 
      className="w-[850px] min-h-[1100px] relative font-sans p-12" 
      style={{ 
        backgroundColor: '#ffffff', 
        color: '#1a1a2e',
        contain: 'paint'
      }}
    >
      {/* Premium Border Frame */}
      <div 
        className="absolute inset-0 m-4 border-[2px] rounded-sm pointer-events-none z-0" 
        style={{ borderColor: '#d4af37' }}
      ></div>
      <div 
        className="absolute inset-0 m-5 border-[1px] rounded-sm pointer-events-none z-0" 
        style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}
      ></div>

      {/* Watermark Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[500px] h-[500px] z-0">
        <PclLogoSvg className="w-full h-full object-contain" style={{ color: '#0f172a' }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 flex flex-col h-full">

        {/* Stamp if paid */}
        {isPaid && (
          <div 
            className="absolute top-20 right-10 rotate-12 border-[3px] px-6 py-3 rounded-lg opacity-80 pointer-events-none z-20 flex flex-col items-center justify-center mix-blend-multiply" 
            style={{ borderColor: '#16a34a', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.05)' }}
          >
            <span className="text-4xl font-black uppercase tracking-widest leading-none">PAID</span>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-1">PCL Finance Hub</span>
            <span className="text-[8px] font-medium mt-1">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-10 pb-8 border-b-[1px]" style={{ borderColor: 'rgba(15, 23, 42, 0.1)' }}>
          <div className="flex items-center gap-6">
            <PclLogoSvg className="w-20 h-20 object-contain drop-shadow-md" style={{ color: '#0f172a' }} />
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none mb-1" style={{ color: '#0f172a', fontFamily: 'Georgia, serif' }}>
                Prudentia College
              </h1>
              <h2 className="text-xl font-bold tracking-widest uppercase mb-1" style={{ color: '#d4af37' }}>
                of Law, Hyderabad
              </h2>
              <p className="text-[10px] font-semibold tracking-wider" style={{ color: '#64748b' }}>
                Recognized by the Bar Council of India (BCI)
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div 
              className="px-5 py-2 mb-3 rounded-sm shadow-sm" 
              style={{ backgroundColor: '#0f172a', color: '#d4af37' }}
            >
              <h3 className="text-[14px] font-black uppercase tracking-[0.2em]">Tax Invoice</h3>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Invoice Ref</p>
              <p className="text-lg font-black tracking-wider" style={{ color: '#0f172a' }}>INV-{invoiceData.id}</p>
            </div>
          </div>
        </div>

        {/* ENTITY INFO */}
        <div className="flex gap-8 mb-12">
          {/* Billed To */}
          <div className="flex-1 p-6 rounded-lg border-[1px]" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <h4 className="text-[9px] font-black uppercase tracking-widest mb-4 border-b-[1px] pb-2" style={{ color: '#64748b', borderColor: '#cbd5e1' }}>
              Billed To
            </h4>
            <p className="text-xl font-black mb-1 tracking-tight" style={{ color: '#0f172a' }}>{studentData?.full_name}</p>
            <p className="text-sm font-bold mb-3" style={{ color: '#d4af37' }}>ERP ID: {studentData?.erp_id}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Course</p>
                <p className="text-xs font-semibold" style={{ color: '#334155' }}>{studentData?.department || 'B.B.A. LL.B. (Hons.)'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Batch</p>
                <p className="text-xs font-semibold" style={{ color: '#334155' }}>{studentData?.academic_batch || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Invoice Details */}
          <div className="w-[250px] p-6 rounded-lg border-[1px] flex flex-col justify-between" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Date of Issue</p>
              <p className="text-sm font-bold" style={{ color: '#0f172a' }}>
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Time</p>
              <p className="text-sm font-bold" style={{ color: '#0f172a' }}>
                {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Payment Status</p>
              <div 
                className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" 
                style={{ 
                  backgroundColor: isPaid ? 'rgba(22, 163, 74, 0.1)' : 'rgba(225, 29, 72, 0.1)', 
                  color: isPaid ? '#16a34a' : '#e11d48',
                  border: `1px solid ${isPaid ? '#16a34a' : '#e11d48'}`
                }}
              >
                {invoiceData.status}
              </div>
            </div>
          </div>
        </div>

        {/* LINE ITEMS */}
        <div className="mb-12 flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[2px]" style={{ borderColor: '#0f172a' }}>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest bg-[#f8fafc]" style={{ color: '#64748b' }}>#</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest bg-[#f8fafc]" style={{ color: '#64748b' }}>Description</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-right bg-[#f8fafc]" style={{ color: '#64748b' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-[1px]" style={{ borderColor: '#e2e8f0' }}>
                <td className="py-6 px-4 text-sm font-bold" style={{ color: '#94a3b8' }}>01</td>
                <td className="py-6 px-4">
                  <p className="font-bold text-lg" style={{ color: '#0f172a' }}>{invoiceData.title || 'Academic Fee'}</p>
                  <p className="text-[11px] font-medium mt-1" style={{ color: '#64748b' }}>Transaction ID: {invoiceData.id}</p>
                  {invoiceData.utr_number && (
                    <p className="text-[11px] font-medium mt-1" style={{ color: '#64748b' }}>UTR / Ref No: {invoiceData.utr_number}</p>
                  )}
                </td>
                <td className="py-6 px-4 text-right font-black text-xl" style={{ color: '#0f172a' }}>
                  &#8377; {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-between items-end mb-16">
          <div className="w-1/2 pr-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>Important Information</h4>
            <p className="text-[10px] leading-relaxed text-justify" style={{ color: '#64748b' }}>
              This document serves as an official receipt for the payment made towards Prudentia College of Law. Please retain this for your records. The payment is subject to realization if made via cheque or DD.
            </p>
          </div>
          <div className="w-1/2 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Total Amount</span>
              <span className="text-3xl font-black" style={{ color: '#d4af37' }}>&#8377; {amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full h-px my-3 opacity-20 bg-white"></div>
            <p className="text-[9px] font-medium uppercase tracking-widest text-right leading-relaxed" style={{ color: '#cbd5e1' }}>
              {numberToWordsIndian(amount)}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-6 border-t-[1px]" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex justify-between items-end">
            <div className="w-2/3">
              <div className="flex gap-4 text-[9px] font-medium" style={{ color: '#94a3b8' }}>
                <p>Website: www.prudentiacollege.edu.in</p>
                <p>Email: accounts@prudentiacollege.edu.in</p>
                <p>Phone: +91 99999 99999</p>
              </div>
            </div>
            <div className="w-1/3 text-right flex flex-col items-end">
              <div className="h-12 w-40 border-b-[1px] mb-2 relative flex items-end justify-end" style={{ borderColor: '#0f172a' }}>
                {/* Signature Simulation */}
                <span className="text-2xl absolute bottom-1 right-2 opacity-80" style={{ fontFamily: "'Brush Script MT', cursive", color: '#0f172a' }}>
                  Authorized Signatory
                </span>
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Registrar (Finance)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default FeeReceiptTemplate;
