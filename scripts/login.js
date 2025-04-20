import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { visibleNoti } from "./noti.js";
import { auth } from "./firebase.js";

const form = document.getElementById('form');
const emailInput = form.querySelector('input[type="text"]');
const passwordInput = form.querySelector('input[type="password"]');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email.includes('@')) email += '@hnpaws.com';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        await visibleNoti("Đăng nhập thành công!", 3000);
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Error during login:", error);

        // specific error handle
        let errorMessage;
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "Tài khoản không tồn tại.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Mật khẩu không chính xác.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Địa chỉ email không hợp lệ.";
                break;
            case 'auth/user-disabled':
                errorMessage = "Tài khoản đã bị vô hiệu hóa.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Quá nhiều yêu cầu, vui lòng thử lại sau.";
                break;
            case 'auth/invalid-credential':
                errorMessage = "Tài khoản không hợp lệ. Bạn đã đăng kí chưa?";
                break;
            default:
                errorMessage = "Đăng nhập thất bại: " + error.message;
                break;
        }

        await visibleNoti(errorMessage, 3000);
    }
});