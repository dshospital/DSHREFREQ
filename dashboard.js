// إعداد الاتصال بـ Supabase
const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

document.addEventListener('DOMContentLoaded', function() {
  loadReferrals();

  document.getElementById('searchDoctorCode').addEventListener('input', loadReferrals);
  document.getElementById('searchNationalId').addEventListener('input', loadReferrals);
  document.getElementById('searchDate').addEventListener('change', loadReferrals);
  document.getElementById('exportExcel').addEventListener('click', exportToExcel);
});

async function loadReferrals() {
  const { data, error } = await client
    .from('referrals_view') // تأكد أن الجدول أو الـ View موجود
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ خطأ تحميل الإحالات:', error.message);
    return;
  }

  const doctorCodeFilter = document.getElementById('searchDoctorCode').value.toLowerCase();
  const nationalIdFilter = document.getElementById('searchNationalId').value.toLowerCase();
  const dateFilter = document.getElementById('searchDate').value;

  const tableBody = document.getElementById('referralsTableBody');
  tableBody.innerHTML = '';

  data.filter(referral => {
    const matchesDoctor = referral.doctor_code?.toLowerCase().includes(doctorCodeFilter);
    const matchesNational = referral.national_id?.toLowerCase().includes(nationalIdFilter);
    const matchesDate = !dateFilter || referral.created_at.startsWith(dateFilter);
    return matchesDoctor && matchesNational && matchesDate;
  }).forEach(referral => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${referral.patient_name || '-'}</td>
      <td>${referral.national_id || '-'}</td>
      <td>${referral.patient_phone || '-'}</td>
      <td>${referral.gender || '-'}</td>
      <td>${referral.doctor_code || '-'}</td>
      <td>${referral.specialty || '-'}</td>
      <td>${referral.clinic_code || '-'}</td>
      <td>${referral.referral_reason || '-'}</td>
      <td>${referral.notes || '-'}</td>
      <td>${new Date(referral.created_at).toLocaleString('ar-EG')}</td>
      <td>${referral.uploaded_files ? referral.uploaded_files.map(link => `<a href="${link}" target="_blank">📎 ملف</a>`).join('<br>') : '-'}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function exportToExcel() {
  const table = document.getElementById('referralsTable');
  const wb = XLSX.utils.table_to_book(table, { sheet: "Referrals" });
  XLSX.writeFile(wb, 'referrals_report.xlsx');
}
