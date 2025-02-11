// --------------------- Khi trang DOM đã tải xong ---------------------
document.addEventListener('DOMContentLoaded', () => {
    loadHouseholds(); // Load danh sách hộ khi trang tải
    // Các lắng nghe khác đã được đăng ký bên dưới
});

// --------------------- Navigation: Chuyển đổi giữa các section ---------------------
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav ul li a");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
            const sections = document.querySelectorAll("main section.section-content");
            sections.forEach(section => section.classList.remove("active-section"));
            const targetId = this.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active-section");
            }
        });
    });
});

// --------------------- Gán giá trị mặc định cho input type="month" ---------------------
document.addEventListener("DOMContentLoaded", function () {
    let today = new Date();
    let year = today.getFullYear();
    let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo 2 chữ số
    let currentMonth = `${year}-${month}`;
    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.value = currentMonth;
    });
});

// --------------------- Hàm định dạng số (thêm dấu phẩy) ---------------------
function formatNumber(num) {
    if (isNaN(num) || num === "") return num;
    return Number(num).toLocaleString();
}

// --------------------- Các hàm lưu trữ dữ liệu qua Google Sheets ---------------------
// Chú ý: Thay đổi SCRIPT_URL thành URL Web App đã triển khai từ Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcei_-8D7aSBQB9eP2sfM4BIDqR8BEcBN6EP53xBsh0HEj_JyZHP3mXSWlUC2P7uOx/exec";

// Lấy danh sách HOUSESHOLDS từ Google Sheets
async function getHouseholds() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getHouseholds`);
        const households = await response.json();
        return households; // Trả về mảng đối tượng
    } catch (error) {
        console.error("Error fetching households:", error);
        return [];
    }
}

// Ghi danh sách HOUSESHOLDS vào Google Sheets
async function setHouseholds(households) {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(households),
            redirect: "follow"
        };
        fetch(`${SCRIPT_URL}?action=setHouseholds`, requestOptions)
            .then((response) => console.log(response))
            .then((result) => console.log(result))
            .catch((error) => console.error(error));

        // const response = await fetch(`${SCRIPT_URL}?action=setHouseholds`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({ households })
        // });
        // const result = await response.json();
        // return result;
    } catch (error) {
        console.error("Error setting households:", error);
    }
}

// Lấy danh sách BILLS từ Google Sheets
async function getBills() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getBills`);
        const bills = await response.json();
        return bills;
    } catch (error) {
        console.error("Error fetching bills:", error);
        return [];
    }
}

// Ghi danh sách BILLS vào Google Sheets
async function setBills(bills) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=setBills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bills })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error setting bills:", error);
    }
}

// --------------------- Xử lý định dạng cho các input số ---------------------
// (Nếu cần, bạn có thể bật lại sự kiện focus/blur cho các ô nhập có class "format-number")
// Khi blur: định dạng lại số có dấu phẩy
document.addEventListener("blur", function (e) {
    if (e.target.classList.contains("format-number")) {
        let val = e.target.value.replace(/,/g, "");
        if (val !== "" && !isNaN(val)) {
            e.target.value = formatNumber(val);
        }
    }
}, true);
// Khi focus: loại bỏ dấu phẩy
document.addEventListener("focus", function (e) {
    if (e.target.classList.contains("format-number")) {
        e.target.value = e.target.value.replace(/,/g, "");
    }
}, true);

// --------------------- Kiểm tra các ô input điện ---------------------
function validateElectricityInputs() {
    let inputs = document.querySelectorAll("#bill-list input");
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("error"); // Thêm màu đỏ nếu chưa nhập
        } else {
            input.classList.remove("error"); // Xóa màu đỏ nếu đã nhập
        }
    });
}

document.addEventListener("input", function (event) {
    if (event.target.closest("#bill-list")) {
        validateElectricityInputs();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    validateElectricityInputs();
});

// --------------------- Quản lý điện ---------------------
async function loadElectricityForm() {
    const billMonth = document.getElementById('bill-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    // Lấy danh sách HOUSESHOLDS (chỉ lọc những hộ có STATUS là Active)
    const allHouseholds = await getHouseholds();
    const households = allHouseholds.filter(h => h.STATUS.toLowerCase() === 'active');
    const tbody = document.getElementById('bill-list');
    tbody.innerHTML = '';

    // Tính tháng trước dựa trên giá trị YYYY-MM
    const [year, month] = billMonth.split('-').map(Number);
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth < 1) { prevMonth = 12; prevYear = year - 1; }
    const prevMonthStr = `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}`;

    // Lấy dữ liệu bill của tháng trước từ sheet BILLS
    const bills = await getBills();
    // Giả sử cột "MONTH" chứa giá trị theo định dạng "YYYY-MM" và cột DETAILS lưu trữ thông tin chi tiết dưới dạng JSON
    let prevBillRecord = bills.find(b => b.MONTH === prevMonthStr);

    households.forEach(household => {
        let oldReading = '';
        if (prevBillRecord && prevBillRecord.DETAILS) {
            // Nếu DETAILS được lưu dưới dạng JSON string, parse nó
            const details = typeof prevBillRecord.DETAILS === 'string'
                ? JSON.parse(prevBillRecord.DETAILS)
                : prevBillRecord.DETAILS;
            const prevDetail = details.find(d => d.code === household.ID);
            if (prevDetail && prevDetail.newReading !== undefined && prevDetail.newReading !== '') {
                oldReading = formatNumber(prevDetail.newReading);
            }
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td data-label="Mã Hộ"><input type="text" value="${household.ID}" disabled /></td>
        <td data-label="Số cũ"><input type="text" class="old-reading format-number" value="${oldReading}" placeholder="Nhập số cũ" ${oldReading ? 'readonly' : ''} /></td>
        <td data-label="Số mới"><input type="text" class="new-reading format-number" placeholder="Nhập số mới" /></td>
        <td data-label="Điện tiêu thụ" class="consumption"><input type="text" value="0" disabled /></td>
        <td data-label="Thành tiền" class="amount"><input type="text" value="0" disabled /></td>
      `;
        tbody.appendChild(tr);
    });

    validateElectricityInputs();
}

async function computeBillAmounts() {
    const billMonth = document.getElementById('bill-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    // Loại bỏ dấu phẩy trước khi chuyển sang số (sử dụng regex /,/g)
    const managementFee = Number(document.getElementById('management-fee').value.replace(/,/g, ""));
    const totalAmount = Number(document.getElementById('total-amount').value.replace(/,/g, ""));
    if (isNaN(managementFee) || isNaN(totalAmount)) {
        alert('Vui lòng nhập đúng phí quản lý và tổng tiền.');
        return;
    }
    const tbody = document.getElementById('bill-list');
    const rows = tbody.querySelectorAll('tr');
    let totalConsumption = 0;
    let billData = [];

    // Tính điện tiêu thụ cho từng hộ (số mới - số cũ)
    rows.forEach(row => {
        const oldReadingInput = row.querySelector('.old-reading');
        const newReadingInput = row.querySelector('.new-reading');
        const oldReading = Number(oldReadingInput.value.replace(/,/g, ""));
        const newReading = Number(newReadingInput.value.replace(/,/g, ""));
        let consumption = 0;
        if (!isNaN(oldReading) && !isNaN(newReading)) {
            consumption = newReading - oldReading;
            if (consumption < 0) consumption = 0;
        }
        totalConsumption += consumption;
        // Cập nhật ô "Điện tiêu thụ"
        const consumptionInput = row.querySelector('.consumption input');
        if (consumptionInput) {
            consumptionInput.value = formatNumber(consumption);
        }
        billData.push({
            code: row.cells[0].textContent,
            oldReading: oldReading,
            newReading: newReading,
            consumption: consumption,
            amount: 0
        });
    });

    if (totalConsumption <= 0) {
        alert('Tổng điện tiêu thụ không hợp lệ.');
        return;
    }

    // Tính giá 1 kWh
    const kwh_amount = totalAmount / totalConsumption;
    // Gán giá trị vào input có id 'kwh-amount' (nếu có)
    const kwhAmountInput = document.getElementById('kwh-amount');
    if (kwhAmountInput) {
        kwhAmountInput.value = formatNumber(kwh_amount);
    }

    // Tính thành tiền cho từng hộ
    // Công thức: (kwh_amount + managementFee) * detail.consumption
    billData = billData.map(detail => {
        const amount = (kwh_amount + managementFee) * detail.consumption;
        return { ...detail, amount: Math.round(amount * 100) / 100 };
    });

    // Cập nhật ô "Thành tiền" cho từng hàng
    rows.forEach((row, index) => {
        const amountInput = row.querySelector('.amount input');
        if (amountInput) {
            amountInput.value = formatNumber(billData[index].amount);
        }
    });

    // Lưu bản ghi bill vào Google Sheets (dùng sheet BILLS)
    let bills = await getBills();
    // Tìm bản ghi cho tháng này (giả sử cột "MONTH" lưu giá trị dạng "YYYY-MM")
    const existingIndex = bills.findIndex(b => b.MONTH === billMonth);
    const billRecord = {
        MONTH: billMonth,
        MANAFEE: managementFee,
        TOTAL_AMOUNT: totalAmount,
        TOTAL_COMSUMPTION: totalConsumption,
        KWH_AMOUNT: kwh_amount,
        DETAILS: billData
    };
    if (existingIndex !== -1) {
        bills[existingIndex] = billRecord;
    } else {
        bills.push(billRecord);
    }
    await setBills(bills);
    alert('Tính toán thành công!');
}

// --------------------- Quản lý hộ ---------------------
async function loadHouseholds() {
    const households = await getHouseholds();
    const tbody = document.getElementById('household-list');
    tbody.innerHTML = '';
    households.forEach(household => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${household.ID}</td>
                      <td>${household.FULLNAME}</td>
                      <td>${household.HECTA}</td>
                      <td>${household.JOINDATE}</td>
                      <td>${household.STATUS}</td>
                      <td>${household.EMAIL}</td>
                      <td>
                        <button onclick="editHousehold('${household.ID}')">Sửa</button>
                        <button onclick="changeStatusHousehold('${household.ID}')">Đổi trạng thái</button>
                      </td>`;
        tbody.appendChild(tr);
    });
}

async function addHousehold() {
    const name = prompt('Nhập họ tên hộ:');
    if (!name) return;
    const hecta = prompt('Nhập số hecta:');
    const joinDate = prompt('Nhập ngày tham gia (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    const status = prompt('Nhập trạng thái (Active/Inactive):', 'Active');
    const email = prompt('Nhập email:');
    const code = generateHouseholdCode(name);
    let households = await getHouseholds();
    households.push({ ID: code, FULLNAME: name, HECTA: hecta, JOINDATE: joinDate, STATUS: status, EMAIL: email });
    await setHouseholds(households);
    loadHouseholds();
}

function generateHouseholdCode(name) {
    let code = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    code += Math.floor(Math.random() * 1000);
    return code;
}

async function editHousehold(code) {
    let households = await getHouseholds();
    const index = households.findIndex(h => h.ID === code);
    if (index === -1) return;
    let household = households[index];
    const name = prompt('Sửa họ tên hộ:', household.FULLNAME);
    const hecta = prompt('Sửa số hecta:', household.HECTA);
    const joinDate = prompt('Sửa ngày tham gia (YYYY-MM-DD):', household.JOINDATE);
    const email = prompt('Sửa email:', household.EMAIL);
    if (name) household.FULLNAME = name;
    if (hecta) household.HECTA = hecta;
    if (joinDate) household.JOINDATE = joinDate;
    if (email) household.EMAIL = email;
    households[index] = household;
    await setHouseholds(households);
    loadHouseholds();
}

async function changeStatusHousehold(code) {
    let households = await getHouseholds();
    const index = households.findIndex(h => h.ID === code);
    if (index === -1) return;
    let household = households[index];
    household.STATUS = (household.STATUS.toLowerCase() === 'active') ? 'Inactive' : 'Active';
    households[index] = household;
    await setHouseholds(households);
    loadHouseholds();
}

// --------------------- Báo cáo ---------------------
function viewReport() {
    const monthInput = document.getElementById('report-month').value;
    const reportDiv = document.getElementById('report-results');
    reportDiv.innerHTML = '';
    if (!monthInput) {
        reportDiv.innerHTML = '<p>Vui lòng chọn tháng/năm để xem báo cáo.</p>';
        return;
    }
    getBills().then(bills => {
        const billRecord = bills.find(b => b.MONTH === monthInput);
        if (!billRecord) {
            reportDiv.innerHTML = `<p>Không có dữ liệu báo cáo cho tháng ${monthInput}.</p>`;
            return;
        }
        let html = `<h3>Báo cáo tháng ${monthInput}</h3>`;
        html += `<p>Phí quản lý: ${billRecord.MANAFEE}</p>`;
        html += `<p>Tổng tiền trong tháng: ${billRecord.TOTAL_AMOUNT}</p>`;
        html += `<table>
                 <thead>
                   <tr>
                     <th>Mã Hộ</th>
                     <th>Số Cũ</th>
                     <th>Số Mới</th>
                     <th>Điện tiêu thụ</th>
                     <th>Thành tiền</th>
                   </tr>
                 </thead>
                 <tbody>`;
        billRecord.DETAILS.forEach(detail => {
            html += `<tr>
                   <td>${detail.code}</td>
                   <td>${detail.oldReading}</td>
                   <td>${detail.newReading}</td>
                   <td>${detail.consumption}</td>
                   <td>${detail.amount}</td>
                 </tr>`;
        });
        html += `</tbody></table>`;
        reportDiv.innerHTML = html;
    });
}

// --------------------- Gửi thông báo ---------------------
function sendNotifications() {
    const monthInput = document.getElementById('notification-month').value;
    if (!monthInput) {
        alert('Vui lòng chọn tháng/năm để gửi thông báo.');
        return;
    }
    getBills().then(bills => {
        const billRecord = bills.find(b => b.MONTH === monthInput);
        if (!billRecord) {
            alert(`Không có dữ liệu cho tháng ${monthInput} để gửi thông báo.`);
            return;
        }
        getHouseholds().then(households => {
            billRecord.DETAILS.forEach(detail => {
                const household = households.find(h => h.ID === detail.code);
                if (household) {
                    console.log(`Gửi thông báo tới ${household.EMAIL}:
  Phí quản lý: ${billRecord.MANAFEE}
  Tổng tiền: ${billRecord.TOTAL_AMOUNT}
  Điện tiêu thụ: ${detail.consumption}
  Thành tiền: ${detail.amount}`);
                    // Tích hợp API gửi email thực tế nếu cần
                }
            });
            alert('Thông báo đã được gửi (giả lập).');
        });
    });
}
