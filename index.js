// تهيئة الاتصال مع Supabase
const client = supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3hka2R1dHhwc3J5YXdtc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTA3ODMsImV4cCI6MjA2MTIyNjc4M30.jutNA8Zo0RxzpBWEXQm5-OPraFNtWFKZe6yZ__d_2Ts'
);

// دالة رفع الملف إلى Supabase Storage
async function uploadFile(file) {
  const filePath = `${Date.now()}-${file.name}`;

  const { data, error } = await client
    .storage
    .from('referral-documents')
    .upload(filePath, file);

  if (error) {
    console.error('خطأ أثناء رفع الملف:', error);
    throw new Error('❌ فشل رفع الملف');
  }

  const publicUrl = client
    .storage
    .from('referral-documents')
    .getPublicUrl(filePath).data.publicUrl;

  return publicUrl;
}

// دالة توليد كود للطبيب
async function generateDoctorCode() {
  const res = await client
    .from('doctors')
    .select('id');

  const doctors = res.data;
  const nextNumber = 1000 + doctors.length + 1;
  return `DOC-${nextNumber}`;
}

// التعامل مع إرسال النموذج
document.getElementById('referralForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const fileInput = form.documents;
  let uploadedFiles = [];

  try {
    // رفع الملفات إذا كانت موجودة
    if (fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const url = await uploadFile(file);
        uploadedFiles.push(url);
      }
    }

    // إنشاء كود للطبيب
    const doctorCode = await generateDoctorCode();

    // إرسال بيانات المريض
    const { data: newPatientData, error: patientError } = await client
      .from('patients')
      .insert([
        {
          patient_name: form.patient_name.value,
          patient_phone: form.patient_phone.value,
          patient_id_number: form.patient_id_number.value
        }
      ])
      .select()
      .single();

    if (patientError) throw patientError;
    const patient_id = newPatientData.id;

    // إرسال بيانات الطبيب
    const { data: newDoctorData, error: doctorError } = await client
      .from('doctors')
      .insert([
        {
          doctor_code: doctorCode,
          doctor_name: form.doctor_name.value,
          specialty: form.specialty.value,
          clinic_code: form.clinic_code.value
        }
      ])
      .select()
      .single();

    if (doctorError) throw doctorError;
    const doctor_id = newDoctorData.id;

    // إرسال بيانات الإحالة
    const { data: newReferralData, error: referralError } = await client
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
    const referral_id = newReferralData.id;

    // ربط الملفات بالإحالة
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

    // نجاح العملية
    form.reset();
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('fileLinks').innerHTML = uploadedFiles.map(link => `<a href="${link}" target="_blank">📎 ملف مرفق</a>`).join('<br>');

  } catch (error) {
    console.error(error);
    alert('❌ حدث خطأ أثناء الإرسال: ' + (error.message || error));
  }
});
