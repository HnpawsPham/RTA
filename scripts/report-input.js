import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { setData } from "./firebase.js"; 
import { visibleNoti } from "./noti.js";
import { loadNav } from "./profile.js";

loadNav();

// go to login if user is not authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) 
        window.location.href = "./login.html";
});

const nameInp = document.getElementById("name");
const decisionInp = document.getElementById("quyet-dinh");
const verdictInp = document.getElementById("ban-an");
const addBtn = document.getElementById('add-btn');
const table = document.querySelector('table');
const confirmBtn = document.getElementById('confirm-btn');
const optionsBtns = document.querySelectorAll("#opt>.btn");

let selectedDocumentType = "sung-cong";

// choose file and content type handle
optionsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector(".opt-chosen").classList.remove("opt-chosen");
        btn.classList.add('opt-chosen');

        selectedDocumentType = btn.name;
        resetTable();
    });
});

// add new row handle
addBtn.addEventListener('click', () => {
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td></td>
        <td>
            <select style="text-align: center;">
                <option value="" disabled selected>Chọn loại tài sản</option>
                ${getAssetOptions(selectedDocumentType)}
            </select>
        </td>
        <td><input type="number" min="0" value="0" class="solved"></td>
        <td><input type="number" min="0" value="0" class="unsolved"></td>
        <td><input type="number" min="0" value="0" class="total" readonly></td>
        <td>
            <select style="text-align: center;">
                <option value="" disabled selected>Chọn lý do</option>
                ${getReasonOptions(selectedDocumentType)}
            </select>
        </td>
        <td><btn class="delete-btn">X</btn></td>
    `;

    table.appendChild(newRow);
    updateRowNumbers();

    const solvedInp = newRow.querySelector('.solved');
    const unsolvedInp = newRow.querySelector('.unsolved');
    const totalInp = newRow.querySelector('.total');

    solvedInp.addEventListener('input', updateTotal);
    unsolvedInp.addEventListener('input', updateTotal);

    const deleteBtn = newRow.querySelector(".delete-btn");

    deleteBtn.addEventListener('click', () => {
        newRow.remove();
        updateRowNumbers();
    });

    function updateTotal() {
        const solved = parseFloat(solvedInp.value) || 0;
        const unsolved = parseFloat(unsolvedInp.value) || 0;
        totalInp.value = solved + unsolved;
    }
});

// submit form handle
confirmBtn.addEventListener('click', async () => {
    const rows = table.querySelectorAll('tr');
    let reports = [];

    let personName = nameInp.value.trim();
    let decision = decisionInp.value.trim();
    let verdict = verdictInp.value.trim();

    rows.forEach(async (row, index) => {
        if (index > 0) {
            const assetType = row.cells[1].querySelector('select').value;
            const solved = parseInt(row.cells[2].querySelector('input[type="number"]').value) || 0;
            const unsolved = parseInt(row.cells[3].querySelector('input[type="number"]').value) || 0;
            const reason = row.cells[5].querySelector('select').value;

            // check if all data is typed
            if (assetType && reason && (solved + unsolved > 0) && personName != "") {
                reports.push({
                    personName: personName,
                    decision: decision,
                    verdict: verdict,
                    documentType: selectedDocumentType,
                    assetType,
                    solved,
                    unsolved,
                    reason
                });
            }
            else {
                await visibleNoti("Vui lòng nhập đầy đủ thông tin báo cáo!", 3000);
                return;
            }
        }
    });

    const userId = auth.currentUser.uid;
    const reportId = `reports/${userId}/${Date.now()}`;
    await setData(reportId, reports);
    
    await visibleNoti("Nộp báo cáo thành công.", 3000);

    resetTable();
    updateRowNumbers();
});

// change content type handle
function getAssetOptions(documentType) {
    switch (documentType) {
        case 'sung-cong':
            return `
                <option value="oto">Ô tô</option>
                <option value="xemay">Xe máy</option>
                <option value="dienthoai-maytinh">Điện thoại, máy tính</option>
                <option value="container">Container</option>
                <option value="tai-san-khac">Tài sản khác</option>
            `;
        case 'tieu-huy':
            return `
                <option value="dienthoai-maytinh">Điện thoại, máy tính</option>
                <option value="container">Container</option>
                <option value="tai-san-khac">Tài sản khác (bao gồm ma túy, tính theo số lượng)</option>
                <option value="ma-tuy">Ma túy (khối lượng GRAM)</option>
            `;
        case 'tam-giu':
            return `
                <option value="oto">Ô tô</option>
                <option value="xemay">Xe máy</option>
                <option value="dienthoai-maytinh">Điện thoại, máy tính</option>
                <option value="container">Container</option>
                <option value="tai-san-khac">Tài sản khác</option>
            `;
        case 'tra':
            return `
                <option value="oto">Ô tô</option>
                <option value="xemay">Xe máy</option>
                <option value="dienthoai-maytinh">Điện thoại, máy tính</option>
                <option value="tai-san-khac">Tài sản khác</option>
            `;
        case 'dang-bao':
            return `
                <option value="oto">Ô tô</option>
                <option value="xemay">Xe máy</option>
                <option value="tai-san-khac">Tài sản khác</option>
            `;
        default:
            return '';
    }
}

function getReasonOptions(documentType) {
    switch (documentType) {
        case 'sung-cong':
            return `
                <option value="chua-tiep-nhan">Sở Tài chính chưa tiếp nhận</option>
                <option value="tang-vat-noi-khac">Tang vật ở nơi khác</option>
                <option value="can-sua-doi">Cần sửa đổi, bổ sung, đính chính</option>
                <option value="ly-do-khac">Lý do khác</option>
            `;
        case 'tieu-huy':
            return `
                <option value="so-luong-lon">Số lượng lớn</option>
                <option value="ma-tuy-lon">Ma túy lớn</option>
                <option value="ly-do-khac">Lý do khác</option>
            `;
        case 'tra':
            return `
                <option value="chua-het-thoi-han">Chưa hết thời hạn 03 tháng</option>
                <option value="duong-su-dang-thu-hinh">Đương sự đang thụ hình</option>
                <option value="tam-giu-de-dam-bao">Tạm giữ để đảm bảo thi hành án</option>
                <option value="tang-vat-o-noi-khac">Tang vật ở nơi khác</option>
                <option value="dang-xu-ly-tai-san">Đang xử lý tài sản do đương sự không đến nhận</option>
                <option value="ly-do-khac">Lý do khác</option>
            `;
        case 'dang-bao':
            return `
                <option value="trong-thoi-han">Trong thời hạn đăng báo</option>
                <option value="dang-sung-cong">Đang sung công</option>
                <option value="ly-do-khac">Lý do khác</option>
            `;
        case 'tam-giu':
            return `
                <option value="ke-bien">Đang trong quá trình kê biên, xử lý</option>
                <option value="da-thx">Đương sự đã THX, đang thực hiện thủ tục trả</option>
                <option value="tang-vat-noi-khac">Tang vật ở nơi khác</option>
                <option value="ly-do-khac">Lý do khác</option>
            `
        default:
            return '';
    }
}

function updateRowNumbers() {
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index > 0) {
            row.cells[0].innerText = index;
            row.cells[0].style.textAlign = "center";
        }
    });
}

function resetTable(){
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, i) => {
        if(i > 0)
            row.remove();
    });
}