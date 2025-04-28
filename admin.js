const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

async function loadStats() {
  const referrals = await client.from('referrals').select('*', { count: 'exact' });
  const doctors = await client.from('doctors').select('*', { count: 'exact' });
  const clinics = await client.from('doctors').select('clinic_code', { count: 'exact' }); // حسب البيانات لو عندك جدول خاص بالمجمعات ممكن تعدل
  const patients = await client.from('patients').select('*', { count: 'exact' });

  document.getElementById('referralsCount').textContent = referrals.count || '0';
  document.getElementById('doctorsCount').textContent = doctors.count || '0';
  document.getElementById('clinicsCount').textContent = clinics.count || '0';
  document.getElementById('patientsCount').textContent = patients.count || '0';
}

document.addEventListener('DOMContentLoaded', loadStats);
