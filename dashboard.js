const SUPABASE_URL = 'https://ihizxyafsdvxivkyquev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3hka2R1dHhwc3J5YXdtc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTA3ODMsImV4cCI6MjA2MTIyNjc4M30.jutNA8Zo0RxzpBWEXQm5-OPraFNtWFKZe6yZ__d_2Ts'; // 🔴 ضع مفتاح مشروعك هنا

async function fetchReferrals() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/referrals?select=*,patients(*),doctors(*),files(*)`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const referrals = await response.json();
  populateTable(referrals);
}

function populateTable(referrals) {
  const tbody = document.querySelector('#referralsTable tbody');
  tbody.innerHTML = '';

  referrals.forEach(referral => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${referral.patients?.patient_name || ''}</td>
      <td>${referral.patients?.patient_id_number || ''}</td>
      <td>${referral.doctors?.doctor_name || ''}</td>
      <td>${referral.doctors?.specialty || ''}</td>
      <td>${referral.referral_reason || ''}</td>
      <td>${new Date(referral.created_at).toLocaleDateString()}</td>
      <td>
        ${referral.files?.map(file => `<a href="${file.file_url}" target="_blank">📄 فتح</a>`).join('<br>') || ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('searchInput').addEventListener('input', function() {
  const search = this.value.toLowerCase();
  const rows = document.querySelectorAll('#referralsTable tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
});

// استدعاء تحميل البيانات عند تشغيل الصفحة
fetchReferrals();
