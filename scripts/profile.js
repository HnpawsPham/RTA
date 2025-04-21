import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getData, setData } from "./firebase.js"; 
import { visibleNoti } from "./noti.js";

// set profile.html dir for index.html or sub pages
let profilePageDir = "./profile.html";
let loginPageDir = "./login.html";

if (window.location.pathname.endsWith('index.html')) {
    profilePageDir = "./pages/profile.html";
    loginPageDir = "./pages/login.html";
}

// Load user profile when authenticated
onAuthStateChanged(auth, async (user) => {
    if (!user) return

    await loadUserProfile(user.uid);
    setupProfileListeners(user.uid);
});

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userData = await getData(`users/${userId}`);
        if (userData) {
            displayUserProfile(userData);
        } else {
            // Create default profile if it doesn't exist
            const defaultProfile = {
                email: auth.currentUser.email,
                displayName: auth.currentUser.email.split('@')[0] || "Guest",
                avatarURL: '../assets/default_avt.png',
                role: 'user',
                department: 'Chưa cập nhật',
                position: 'Chưa cập nhật',
                phone: 'Chưa cập nhật'
            };
            
            await setData(`users/${userId}`, defaultProfile);
            displayUserProfile(defaultProfile);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        visibleNoti("Lỗi khi tải thông tin người dùng", 3000);
    }
}

function displayUserProfile(userData) {
    // Update username in navigation
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = userData.displayName || userData.email.split('@')[0];
    }
    
    // Update avatar
    const avatarElement = document.getElementById('avt');
    if (avatarElement) {
        avatarElement.src = userData.avatarURL || '../assets/default_avt.png';
    }
    
    // Update profile
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        const inputs = {
            'profile-name': userData.displayName || '',
            'profile-email': userData.email || '',
            'profile-department': userData.department || '',
            'profile-position': userData.position || '',
            'profile-phone': userData.phone || ''
        };
        
        for (const [id, value] of Object.entries(inputs)) {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        }
        
        // Update profile image
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = userData.avatarURL || '../assets/default_avt.png';
        }
    }
}

// log out handle
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      await visibleNoti("Bạn đã đăng xuất thành công", 3000);
      window.location.href = "./login.html";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      await visibleNoti("Đăng xuất thất bại: " + error.message, 3000);
    }
  });
}

function setupProfileListeners(userId) {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedProfile = {
                displayName: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                department: document.getElementById('profile-department').value,
                position: document.getElementById('profile-position').value,
                phone: document.getElementById('profile-phone').value,
                avatarURL: document.getElementById('profile-image').src
            };
            
            try {
                await setData(`users/${userId}`, updatedProfile);
                visibleNoti("Cập nhật thông tin thành công", 3000);
                
                // Update navigation elements
                const usernameElement = document.getElementById('username');
                if (usernameElement) 
                    usernameElement.textContent = updatedProfile.displayName;
                
                const avatarElement = document.getElementById('avt');
                if (avatarElement) 
                    avatarElement.src = updatedProfile.avatarURL;
    
            } catch (error) {
                console.error("Error updating profile:", error);
                visibleNoti("Lỗi khi cập nhật thông tin", 3000);
            }
        });
        
        // Image upload handling
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) 
            imageUpload.addEventListener('change', handleImageUpload);
    }
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {

            const profileImage = document.getElementById('profile-image');
            if (profileImage) 
                profileImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

export function loadNav() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userData = await getData(`users/${user.uid}`);
            
            // Update username
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = userData?.displayName || user.email.split('@')[0];
            }
            
            // Update avatar
            const avatarElement = document.getElementById('avt');
            if (avatarElement) {
                avatarElement.src = userData?.avatarURL || '../assets/default_avt.png';
            }
            
            // profile navigation
            if (avatarElement) {
                avatarElement.addEventListener('click', () => {
                    window.location.href = profilePageDir;
                });
            }

            if (usernameElement) {
                usernameElement.style.cursor = 'pointer';
                usernameElement.addEventListener('click', () => {
                    window.location.href = profilePageDir;
                });
            }
        }
    });
    
    // Load memes if on index page
    const grid = document.getElementById("image-grid");
    if (grid) {
        const totalMemes = 10;
        for(let i = 1; i <= totalMemes; i++){
            let img = document.createElement("img");
            img.src = `./assets/pic (${i}).jpg`;
            grid.appendChild(img);
        }
    }
}

loadNav();