// ربط Supabase
const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

// تحميل بيانات الإحالات وعرضها
async function loadReferrals() {
  const { data: referrals, error } = await client
    .from('referrals')
    .select(`
      id,
      created_at,
      referral_reason,
      notes,
      patients (
        full_name,
        national_id,
        phone_number,
        gender
      ),
      doctors (
        doctor_code,
        clinic_code
      ),
      files (
        file_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ خطأ أثناء تحميل البيانات:', error);
    return;
  }

  const tableBody = document.getElementById('referralTableBody');
  tableBody.innerHTML = '';

  referrals.forEach(referral => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${referral.patients?.full_name || '-'}</td>
      <td>${referral.patients?.national_id || '-'}</td>
      <td>${referral.patients?.phone_number || '-'}</td>
      <td>${referral.patients?.gender || '-'}</td>
      <td>${referral.doctors?.doctor_code || '-'}</td>
      <td>${referral.doctors?.clinic_code || '-'}</td>
      <td>${referral.referral_reason || '-'}</td>
      <td>${referral.notes || '-'}</td>
      <td>
        ${
          referral.files?.length
            ? referral.files.map(file => `<a href="${file.file_url}" target="_blank">📎</a>`).join(' ')
            : 'لا يوجد ملفات'
        }
      </td>
      <td>${new Date(referral.created_at).toLocaleString()}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadReferrals);
