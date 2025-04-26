
const SUPABASE_URL = 'https://ihizxyafsdvxivkyquev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo';

async function fetchReferrals() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/referrals?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  const data = await response.json();
  displayReferrals(data);
}

function displayReferrals(referrals) {
  const tbody = document.getElementById('referralsBody');
  tbody.innerHTML = '';
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

document.getElementById('searchInput').addEventListener('input', function() {
  const value = this.value.toLowerCase();
  Array.from(document.querySelectorAll('#referralsBody tr')).forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(value) ? '' : 'none';
  });
});

document.getElementById('dateFilter').addEventListener('input', function() {
  const selectedDate = this.value;
  Array.from(document.querySelectorAll('#referralsBody tr')).forEach(row => {
    const dateCell = row.children[6]?.textContent.split(' ')[0];
    row.style.display = dateCell === selectedDate ? '' : 'none';
  });
});

fetchReferrals();
