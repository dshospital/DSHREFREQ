// ربط Supabase
const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo'
);

// رفع الملفات إلى البوكت
async function uploadFile(file) {
  const cleanFileName = file.name.replace(/\s+/g, '-').replace(/[^\w.-]/g, '');
  const filePath = `uploads/${Date.now()}-${cleanFileName}`;

  const { data, error } = await client
    .storage
    .from('referral-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false // ملاحظة: لا تسمح بالاستبدال (يمكن تغييره إلى true لو أردت)
    });

  if (error) {
    console.error('❌ خطأ أثناء رفع الملف:', error);
    throw new Error(error.message || '❌ فشل رفع الملف');
  }

  const { publicUrl } = client
    .storage
    .from('referral-documents')
    .getPublicUrl(filePath).data;

  return publicUrl;
}

// إرسال النموذج
document.getElementById('referralForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const fileInput = form.documents;
  let uploadedFiles = [];

  try {
    // رفع الملفات
    if (fileInput && fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const url = await uploadFile(file);
        uploadedFiles.push(url);
      }
    }

    // حفظ بيانات المريض
    const { data: patientData, error: patientError } = await client
      .from('patients')
      .insert([
        {
          full_name: form.patient_name.value,
          national_id: form.patient_id.value,
          phone_number: form.patient_phone.value,
          gender: form.gender.value
        }
      ])
      .select()
      .single();

    if (patientError) throw patientError;
    const patient_id = patientData.id;

    // الحصول على doctor_code الذي أدخله المستخدم
    const doctorCodeFromForm = form.doctor_code.value;

    // البحث عن الطبيب بناءً على الكود
    const { data: doctorData, error: doctorFetchError } = await client
      .from('doctors')
      .select('*')
      .eq('doctor_code', doctorCodeFromForm)
      .single();

    if (doctorFetchError) {
      throw new Error('❌ لم يتم العثور على الطبيب بهذا الكود');
    }
    const doctor_id = doctorData.id;

    // حفظ بيانات الإحالة
    const { data: referralData, error: referralError } = await client
      .from('referrals')
      .insert([
        {
          patient_id: patient_id,
          doctor_id: doctor_id,
          referral_reason: form.referral_reason.value,
          notes: form.notes.value
        }
      ])
      .select()
      .single();

    if (referralError) throw referralError;
    const referral_id = referralData.id;

    // حفظ روابط الملفات
    for (const url of uploadedFiles) {
      await client
        .from('files')
        .insert([
          {
            referral_id: referral_id,
            file_url: url
          }
        ]);
    }

    // إعادة ضبط النموذج وعرض رسالة النجاح
    form.reset();
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('fileLinks').innerHTML = uploadedFiles.map(link => `<a href="${link}" target="_blank">📎 ملف مرفق</a>`).join('<br>');

  } catch (error) {
    console.error(error);
    alert('❌ حدث خطأ أثناء الإرسال: ' + (error.message || error));
  }
});
