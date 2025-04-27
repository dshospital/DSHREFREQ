// ربط Supabase
const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

// إرسال بيانات الطبيب
document.getElementById('doctorForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;

  try {
    const { error } = await client
      .from('doctors')
      .insert([
        {
          doctor_name: form.doctor_name.value,
          doctor_code: form.doctor_code.value,
          clinic_code: form.clinic_code.value,
          specialty: form.specialty.value
        }
      ]);

    if (error) throw error;

    form.reset();
    document.getElementById('successMessage').style.display = 'block';

  } catch (error) {
    console.error(error);
    alert('❌ حدث خطأ أثناء إضافة الطبيب: ' + (error.message || error));
  }
});
