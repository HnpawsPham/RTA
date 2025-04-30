import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getData } from "./firebase.js";
import { loadNav } from "./profile.js";

loadNav();
const tableContainers = document.querySelectorAll(".table-container");

// Go to login if user is not authenticated
onAuthStateChanged(auth, async (user) => {
    if (!user) window.location.href = "./login.html";
    else {
        const reports = await getData(`reports`);
        const users = await getData("users");

        await loadReports(reports);
        await loadTopEmployees(reports, users);
    }
});

// Search bars handle
tableContainers.forEach(container => {
    const searchBar = container.querySelector(".search-bar");
    const table = container.querySelector(".report-category");
    const tbody = table.querySelector("tbody");

    searchBar.addEventListener("input", () => {
        const userInp = searchBar.value.toLowerCase().trim();

        if (userInp === "") {
            Array.from(tbody.querySelectorAll("tr:not(.no-results)")).forEach(row => {
                row.style.display = "";
            });
            const noResult = tbody.querySelector(".no-results");
            if (noResult) noResult.remove();
            return;
        }

        const rows = Array.from(tbody.querySelectorAll("tr:not(.no-results)"));
        rows.forEach(row => {
            const matched = Array.from(row.cells).some(cell =>
                cell.textContent.toLowerCase().includes(userInp)
            );
            row.style.display = matched ? "" : "none";
        });

        handleEmptyTable(tbody);
    });
});


// display reports on each table
async function loadReports(allReports) {
    // Loop through all users in the reports
    for (const userId in allReports) {
        const reportsByUser = allReports[userId];

        for (const reportId in reportsByUser) {
            const reports = reportsByUser[reportId];

            for (const report of reports) {
                const documentType = report.documentType;
                const tableBody = document.querySelector(`#${documentType} tbody`);
                if (!tableBody) continue;

                // Create a new row for the report
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td>${report.personName}</td>
                  <td>${report.decision}</td>
                  <td>${report.verdict}</td>
                  <td>${formatAssetType(report.assetType)}</td>
                  <td>${formatReason(report.reason)}</td>
                  <td>${report.solved}</td>
                  <td>${report.unsolved}</td>
                  <td>${report.solved + report.unsolved}</td>
              `;
                tableBody.appendChild(row);
            }
        }
    }
    const allTables = document.querySelectorAll(".report-category");
    allTables.forEach(table => {
        const tbody = table.querySelector("tbody");
        handleEmptyTable(tbody);
    });
}

// Format asset type for display
function formatAssetType(assetType) {
    const types = {
        "oto": "Ô tô",
        "xemay": "Xe máy",
        "dienthoai-maytinh": "Điện thoại, máy tính",
        "container": "Container",
        "tai-san-khac": "Tài sản khác",
        "ma-tuy": "Ma túy",
    };
    return types[assetType] || assetType;
}

function formatContentType(contentType) {
    const types = {
        "sung-cong": "Sung công",
        "tieu-huy": "Tiêu hủy",
        "tra": "Trả",
        "tam-giu": "Tạm giữ để xử lí",
        "dang-bao": "Đăng báo tìm CHS",
    };
    return types[contentType] || contentType;
}

// Format reason for human beings
function formatReason(reason) {
    const reasons = {
        "chua-tiep-nhan": "Sở Tài chính chưa tiếp nhận",
        "tang-vat-noi-khac": "Tang vật ở nơi khác",
        "can-sua-doi": "Cần sửa đổi, bổ sung, đính chính",
        "ly-do-khac": "Lý do khác",
        "so-luong-lon": "Số lượng lớn",
        "ma-tuy-lon": "Ma túy lớn",
        "chua-het-thoi-han": "Chưa hết thời hạn 03 tháng",
        "duong-su-dang-thu-hinh": "Đương sự đang thụ hình",
        "tam-giu-de-dam-bao": "Tạm giữ để đảm bảo thi hành án",
        "tang-vat-o-noi-khac": "Tang vật ở nơi khác",
        "dang-xu-ly-tai-san": "Đang xử lý tài sản do đương sự không đến nhận",
        "trong-thoi-han": "Trong thời hạn đăng báo",
        "dang-sung-cong": "Đang sung công",
        "ke-bien" : "Đang trong quá trình kê biên, xử lý",
        "da-thx" : "Đương sự đã THX, đang thực hiện thủ tục trả",
        "tang-vat-noi-khac" : "Tang vật ở nơi khác"
    };
    return reasons[reason] || reason;
}

async function loadTopEmployees(allReports, users) {
    try {
        const employeeCounts = {};

        for (const userId in allReports) {
            const reports = allReports[userId];
            let totalReports = 0;
            let totalItems = 0;

            for (const reportId in reports) {
                totalReports++;
                totalItems += reports[reportId].length;
            }

            const email = users && users[userId] ? users[userId].email : userId;

            employeeCounts[userId] = {
                id: userId,
                reportCount: totalReports,
                itemCount: totalItems,
            };
        }

        displayTopEmployees(employeeCounts, users);
    } catch (error) {
        console.error("Error loading top employees:", error);
    }
}

function displayTopEmployees(employeeCounts, users) {
    // Sort employees by report cnt
    const sortedEmployees = Object.entries(employeeCounts).sort(
        (a, b) => b[1].itemCount - a[1].itemCount
    );
    if (sortedEmployees.length === 0) return;

    // Display top employee
    const topEmployee = sortedEmployees[0][1];
    const topEmployeeSection = document.querySelector(".top-employee");

    if (topEmployeeSection) {
        const avatar = topEmployeeSection.querySelector(".employee-avatar");
        const name = topEmployeeSection.querySelector("#top1-name");
        const achievement = topEmployeeSection.querySelector(".achievement");

        const currentEmployee = users[topEmployee.id];

        name.textContent = currentEmployee.displayName;
        avatar.src = currentEmployee.avatarURL || "../assets/default_avt.png";
        achievement.textContent = `Số báo cáo nhập được: ${topEmployee.itemCount}`;

        // more info
        const department = topEmployeeSection.querySelector(".employee-department");
        const position = topEmployeeSection.querySelector(".employee-position");

        department.textContent = `Phòng ban: ${currentEmployee.department || "Chưa cập nhật"
            }`;
        position.textContent = `Vị trí: ${currentEmployee.position || "Chưa cập nhật"
            }`;
    }

    // Display other employees
    const otherEmployeesContainer = document.querySelector(".other-employees");
    otherEmployeesContainer.innerHTML = "";

    // Skip the first employee (top employee) and display the rest
    for (let i = 1; i < Math.min(sortedEmployees.length, 6); i++) {
        const [tmp, cur] = sortedEmployees[i];
        const employee = users[cur.id];

        const employeeCard = document.createElement("div");
        employeeCard.classList.add("employee-card");
        employeeCard.innerHTML = `
            <img src="${employee.avatarURL || "../assets/default_avt.png"
            }" alt="${employee.username}">
            <p>${employee.displayName}</p>
            <div class="report-count">${cur.itemCount} báo cáo</div>
        `;
        otherEmployeesContainer.appendChild(employeeCard);
    }

    // no employee handle
    if (sortedEmployees.length === 1) {
        const noEmployeeCard = document.createElement("div");
        noEmployeeCard.classList.add("employee-card", "empty-card");
        noEmployeeCard.innerHTML = `
            <p>Không còn ai khác.</p>
        `;
        otherEmployeesContainer.appendChild(noEmployeeCard);
    }
}

function handleEmptyTable(tbody) {
    const visibleRows = Array.from(tbody.querySelectorAll("tr:not(.no-results)")).filter(row => row.style.display !== "none");
    let noResult = tbody.querySelector(".no-results");

    if (visibleRows.length === 0)
        if (!noResult) {
            noResult = document.createElement("tr");
            noResult.className = "no-results";
            noResult.innerHTML = `<td colspan="8" style="text-align:center;">Không có kết quả nào.</td>`;
            tbody.appendChild(noResult);
        }
        else if (noResult) noResult.remove();
}