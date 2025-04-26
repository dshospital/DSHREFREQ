
const SUPABASE_URL = 'https://ihizxyafsdvxivkyquev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo';

let referralsData = [];

async function fetchReferrals() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/referrals?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  referralsData = await response.json();
  displayReferrals(referralsData);
  document.getElementById('referralCount').textContent = `عدد الطلبات الكلي: ${referralsData.length}`;
}

function displayReferrals(referrals) {
  const tbody = document.getElementById('referralsBody');
  tbody.innerHTML = '';
  if (referrals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">⚠️ لا توجد نتائج لعرضها.</td></tr>';
    return;
  }
  referrals.forEach(referral => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${referral.patient_name || ''}</td>
      <td>${referral.patient_id || ''}</td>
      <td>${referral.patient_phone || ''}</td>
      <td>${referral.referral_reason || ''}</td>
      <td>${referral.doctor_name || ''}</td>
      <td>${referral.specialty || ''}</td>
      <td>${referral.created_at ? new Date(referral.created_at).toLocaleString('ar-EG') : ''}</td>
      <td>${referral.uploaded_files && referral.uploaded_files.length ? referral.uploaded_files.map(file => `<a class="download-btn" href="${file}" target="_blank">تحميل</a>`).join('<br>') : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportToCSV() {
  const csvRows = [
    ["اسم المريض", "رقم الهوية", "رقم الجوال", "سبب التحويل", "اسم الطبيب", "التخصص", "تاريخ الإرسال", "روابط الملفات"]
  ];
  referralsData.forEach(r => {
    csvRows.push([
      r.patient_name || '',
      r.patient_id || '',
      r.patient_phone || '',
      r.referral_reason || '',
      r.doctor_name || '',
      r.specialty || '',
      r.created_at || '',
      r.uploaded_files ? r.uploaded_files.join(' | ') : ''
    ]);
  });
  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'referrals_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById('searchInput').addEventListener('input', function() {
  const value = this.value.toLowerCase();
  const filtered = referralsData.filter(r =>
    r.patient_name?.toLowerCase().includes(value) ||
    r.patient_id?.toLowerCase().includes(value)
  );
  displayReferrals(filtered);
});

document.getElementById('dateFilter').addEventListener('input', function() {
  const selectedDate = this.value;
  const filtered = referralsData.filter(r => r.created_at?.split('T')[0] === selectedDate);
  displayReferrals(filtered);
});

document.getElementById('exportCSV').addEventListener('click', exportToCSV);

fetchReferrals();
