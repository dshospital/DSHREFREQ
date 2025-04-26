// إنشاء عميل Supabase
const supabase = supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3hka2R1dHhwc3J5YXdtc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTA3ODMsImV4cCI6MjA2MTIyNjc4M30.jutNA8Zo0RxzpBWEXQm5-OPraFNtWFKZe6yZ__d_2Ts'
);

// رفع ملف إلى Bucket
async function uploadFile(file) {
  const filePath = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase
    .storage
    .from('referral-documents') // اسم الباكيت
    .upload(filePath, file);

  if (error) {
    console.error('خطأ أثناء رفع الملف:', error);
    throw new Error('❌ فشل في رفع الملف');
  }

  // بعد الرفع نحصل على الرابط العام
  const publicUrl = supabase
    .storage
    .from('referral-documents')
    .getPublicUrl(filePath).data.publicUrl;

  return publicUrl;
}

// باقي الكود الخاص بحفظ بيانات الإحالة
document.getElementById('referralForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const fileInput = form.documents;
  let uploadedFiles = [];

  try {
    if (fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const url = await uploadFile(file);
        uploadedFiles.push(url);
      }
    }

    // يمكنك إكمال الكود كما كتبناه سابقاً لحفظ بيانات المريض والطبيب والإحالة إلى الجداول الأخرى.

    form.reset();
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('fileLinks').innerHTML = uploadedFiles.map(link => `<a href="${link}" target="_blank">📎 ملف</a>`).join('<br>');

  } catch (error) {
    alert('❌ حدث خطأ أثناء الإرسال: ' + error.message);
  }
});
