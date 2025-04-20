import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { visibleNoti } from "./noti.js";
import { auth, setData } from "./firebase.js";

const form = document.getElementById('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    let email = emailInput.value.trim().toLowerCase(); 
    const password = passwordInput.value; 

    // check if user input email or username
    if (!email.includes('@')) 
        email += '@hnpaws.com'; 

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // save user info
        let newUser = {
            email: email,
            phone: "",
            displayName: email.split("@")[0],
            avatarURL: "",
            position: "",
            department: "",
        }

        await setData(`users/${user.uid}`, newUser);

        // back to homepage
        await visibleNoti("Đăng ký thành công!", 3000); 
        window.location.href = "../index.html"; 
    } catch (error) {
        console.error("Error during signup:", error);
        await visibleNoti("Đăng ký thất bại: " + error.message, 3000); 
    }
});
