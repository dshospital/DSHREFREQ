const client = window.supabase.createClient(
  'https://ihizxyafsdvxivkyquev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc3hka2R1dHhwc3J5YXdtc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTA3ODMsImV4cCI6MjA2MTIyNjc4M30.jutNA8Zo0RxzpBWEXQm5-OPraFNtWFKZe6yZ__d_2Ts'
);

async function uploadFile(file) {
  const filePath = `${Date.now()}-${file.name}`;

  const { data, error } = await client
    .storage
    .from('referral-documents')
    .upload(filePath, file);

  if (error) {
    console.error('❌ خطأ أثناء رفع الملف:', error);
    throw new Error('❌ فشل رفع الملف');
  }

  const publicUrl = client
    .storage
    .from('referral-documents')
    .getPublicUrl(filePath).data.publicUrl;

  return publicUrl;
}
