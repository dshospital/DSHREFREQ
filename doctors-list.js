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
      <td>${doctor.doctor_name || '-'}</td>    <!-- هنا تصحيح -->
      <td>${doctor.doctor_code}</td>
      <td>${doctor.clinic_code}</td>
      <td>${doctor.specialty || '-'}</td>
      <td>${new Date(doctor.created_at).toLocaleString()}</td>
    `;

    tableBody.appendChild(tr);
  });
}
