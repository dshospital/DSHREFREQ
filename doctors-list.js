// ربط Supabase
const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

// تحميل قائمة الأطباء
async function loadDoctors() {
  const { data: doctors, error } = await client
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ خطأ أثناء تحميل الأطباء:', error);
    return;
  }

  const tableBody = document.getElementById('doctorsTableBody');
  tableBody.innerHTML = '';

  doctors.forEach(doctor => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${doctor.doctor_name || '-'}</td>
      <td>${doctor.doctor_code}</td>
      <td>${doctor.clinic_code}</td>
      <td>${doctor.specialty || '-'}</td>
      <td>${new Date(doctor.created_at).toLocaleString()}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// تحميل عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadDoctors);
