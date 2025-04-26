
const SUPABASE_URL = 'https://ihizxyafsdvxivkyquev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaXp4eWFmc2R2eGl2a3lxdWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTcxMDMsImV4cCI6MjA2MTIzMzEwM30.BFtLt4I6JnRzAmHf5reEaDL1h-f-nMBIsSQUfC5M5Zo';

function showModal(message, type = 'success') {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
  modal.style.color = type === 'success' ? '#155724' : '#721c24';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  modal.style.zIndex = '1001';
  modal.innerText = message;
  document.body.appendChild(modal);
  setTimeout(() => { modal.remove(); }, 3000);
}

async function uploadFile(file) {
  const timestamp = Date.now();
  const filePath = `referral-documents/${timestamp}-${file.name}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${filePath}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'Cache-Control': 'max-age=3600'
    },
    body: file
  });
  if (!response.ok) throw new Error('خطأ أثناء رفع الملف إلى التخزين');
  return `${SUPABASE_URL}/storage/v1/object/public/${filePath}`;
}

document.getElementById('referralForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const fileInput = form.querySelector('input[name="documents"]');
  let uploadedFiles = [];

  const loadingDiv = document.getElementById('loadingOverlay');
  if (loadingDiv) loadingDiv.style.display = 'flex';

  try {
    if (fileInput && fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const fileUrl = await uploadFile(file);
        uploadedFiles.push(fileUrl);
      }
    }

    const formData = {
      patient_name: form.patient_name.value,
      patient_phone: form.patient_phone.value,
      patient_id: form.patient_id.value,
      referral_reason: form.referral_reason.value,
      doctor_name: form.doctor_name.value,
      specialty: form.specialty.value,
      clinic_phone: form.clinic_phone.value,
      notes: form.notes.value,
      uploaded_files: uploadedFiles
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/referrals`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.text();
    console.log("📡 رد Supabase:", result);

    if (!response.ok) throw new Error('فشل في حفظ البيانات. الرد: ' + result);

    form.reset();
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('fileLinks').innerHTML = uploadedFiles.map(url => `<a href="${url}" target="_blank">📎 ملف مرفق</a>`).join('<br>');
    showModal('✅ تم إرسال البيانات بنجاح!');

  } catch (error) {
    console.error("❌ خطأ أثناء الإرسال:", error);
    showModal('❌ حدث خطأ أثناء الإرسال: ' + error.message, 'error');
  } finally {
    if (loadingDiv) loadingDiv.style.display = 'none';
  }
});
