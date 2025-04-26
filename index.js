const SUPABASE_URL = 'https://ihizxyafsdvxivkyquev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3hka2R1dHhwc3J5YXdtc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTA3ODMsImV4cCI6MjA2MTIyNjc4M30.jutNA8Zo0RxzpBWEXQm5-OPraFNtWFKZe6yZ__d_2Ts'; // 🔴 ضع هنا مفتاح Supabase الخاص بك

async function uploadFile(file) {
  const filePath = `referral-documents/${Date.now()}-${file.name}`;
  
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/referral-documents/${filePath}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type
    },
    body: file
  });

  if (!response.ok) {
    throw new Error('خطأ أثناء رفع الملف');
  }

  return `${SUPABASE_URL}/storage/v1/object/public/referral-documents/${filePath}`;
}

async function generateDoctorCode() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/doctors?select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const doctors = await res.json();
  const nextNumber = 1000 + doctors.length + 1;
  return `DOC-${nextNumber}`;
}

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

    const doctorCode = await generateDoctorCode();

    const patientData = {
      patient_name: form.patient_name.value,
      patient_phone: form.patient_phone.value,
      patient_id_number: form.patient_id_number.value
    };

    const patientResponse = await fetch(`${SUPABASE_URL}/rest/v1/patients`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    const newPatient = await patientResponse.json();
    const patient_id = newPatient[0].id;

    const doctorData = {
      doctor_code: doctorCode,
      doctor_name: form.doctor_name.value,
      specialty: form.specialty.value,
      clinic_code: form.clinic_code.value
    };

    const doctorResponse = await fetch(`${SUPABASE_URL}/rest/v1/doctors`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doctorData)
    });

    const newDoctor = await doctorResponse.json();
    const doctor_id = newDoctor[0].id;

    const referralData = {
      patient_id: patient_id,
      doctor_id: doctor_id,
      referral_reason: form.referral_reason.value,
      notes: form.notes.value
    };

    const referralResponse = await fetch(`${SUPABASE_URL}/rest/v1/referrals`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(referralData)
    });

    const newReferral = await referralResponse.json();
    const referral_id = newReferral[0].id;

    for (const url of uploadedFiles) {
      await fetch(`${SUPABASE_URL}/rest/v1/files`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referral_id: referral_id,
          file_url: url
        })
      });
    }

    form.reset();
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('fileLinks').innerHTML = uploadedFiles.map(link => `<a href="${link}" target="_blank">📎 ملف</a>`).join('<br>');

  } catch (error) {
    alert('❌ حدث خطأ أثناء الإرسال: ' + error.message);
  }
});
