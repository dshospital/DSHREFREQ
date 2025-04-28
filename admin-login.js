document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('errorMessage');

  if (username === "admin" && password === "dsh1234") {
    // تسجيل دخول ناجح
    window.location.href = "admin.html"; // يوجه إلى لوحة الأدمن
  } else {
    errorMessage.textContent = "❌ اسم المستخدم أو كلمة المرور غير صحيحة!";
    errorMessage.style.display = 'block';
  }
});
