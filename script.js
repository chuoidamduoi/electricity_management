// script.js

document.addEventListener('DOMContentLoaded', () => {
    loadHouseholds();
    // loadBillList();
});

/* ---------------- Navigation: Chuyển đổi giữa các section ---------------- */
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

document.addEventListener("DOMContentLoaded", function () {
    // Lấy ngày hiện tại
    let today = new Date();
    let year = today.getFullYear();
    let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo luôn có 2 chữ số
    let currentMonth = `${year}-${month}`;

    // Gán giá trị mặc định cho các input type="month"
    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.value = currentMonth;
    });
});
/* ---------------- Hàm format số với dấu phẩy ---------------- */
function formatNumber(num) {
    if (isNaN(num) || num === "") return num;
    return Number(num).toLocaleString();
}

// ---------- Các hàm hỗ trợ lưu trữ dữ liệu trong localStorage ----------
function getHouseholds() {
    return JSON.parse(localStorage.getItem('households')) || [];
}

function setHouseholds(households) {
    localStorage.setItem('households', JSON.stringify(households));
}

function getBills() {
    return JSON.parse(localStorage.getItem('bills')) || [];
}

function setBills(bills) {
    localStorage.setItem('bills', JSON.stringify(bills));
}

/* ---------------- Xử lý định dạng cho các input số ---------------- */
// Khi blur, chuyển giá trị sang định dạng có dấu phẩy
// document.addEventListener("blur", function (e) {
//     if (e.target.classList.contains("format-number")) {
//         let val = e.target.value.replace(/,/g, "");
//         if (val !== "" && !isNaN(val)) {
//             e.target.value = formatNumber(val);
//         }
//     }
// }, true);

// Khi focus, loại bỏ dấu phẩy để nhập số dễ dàng
// document.addEventListener("focus", function (e) {
//     if (e.target.classList.contains("format-number")) {
//         e.target.value = e.target.value.replace(/,/g, "");
//     }
// }, true);

/* ---------------- Các hàm hỗ trợ lưu trữ dữ liệu ---------------- */
function getHouseholds() {
    return JSON.parse(localStorage.getItem('households')) || [];
}
function setHouseholds(households) {
    localStorage.setItem('households', JSON.stringify(households));
}
function getBills() {
    return JSON.parse(localStorage.getItem('bills')) || [];
}
function setBills(bills) {
    localStorage.setItem('bills', JSON.stringify(bills));
}

/* ---------------- Quản lý hộ tham gia (ví dụ đơn giản) ---------------- */
function addHousehold() {
    const name = prompt('Nhập họ tên hộ:');
    if (!name) return;
    const hecta = prompt('Nhập số hecta:');
    const joinDate = prompt('Nhập ngày tham gia (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    const status = prompt('Nhập trạng thái (Active/Inactive):', 'Active');
    const email = prompt('Nhập email:');
    // Sinh mã hộ đơn giản: lấy chữ cái đầu của mỗi từ cộng số ngẫu nhiên
    const code = name.split(' ').map(word => word[0].toUpperCase()).join('') + Math.floor(Math.random() * 1000);
    const households = getHouseholds();
    households.push({ code, name, hecta, joinDate, status, email });
    setHouseholds(households);
    alert('Hộ mới đã được thêm.');
}

/* ---------------- Quản lý tiền điện ---------------- */
function validateElectricityInputs() {
    let inputs = document.querySelectorAll("#bill-list input");
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("error"); // Thêm màu đỏ nếu chưa nhập
        } else {
            input.classList.remove("error"); // Bỏ màu đỏ nếu đã nhập
        }
    });
}

// Gọi kiểm tra mỗi khi nhập dữ liệu
document.addEventListener("input", function (event) {
    if (event.target.closest("#bill-list")) {
        validateElectricityInputs();
    }
});

// Kiểm tra ngay khi load trang
document.addEventListener("DOMContentLoaded", function () {
    validateElectricityInputs();
});


// Hàm load form nhập số điện cho từng hộ dựa trên tháng đã chọn và số cũ (lấy từ bill tháng trước nếu có)
function loadElectricityForm() {
    const billMonth = document.getElementById('bill-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    const households = getHouseholds().filter(h => h.status.toLowerCase() === 'active');
    const tbody = document.getElementById('bill-list');
    tbody.innerHTML = '';

    // Tính tháng trước dựa trên giá trị YYYY-MM
    const [year, month] = billMonth.split('-').map(Number);
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth < 1) { prevMonth = 12; prevYear = year - 1; }
    const prevMonthStr = `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}`;

    // Lấy dữ liệu bill của tháng trước (nếu có)
    const bills = getBills();
    let prevBillRecord = bills.find(b => b.month === prevMonthStr);

    households.forEach(household => {
        let oldReading = '';
        if (prevBillRecord && prevBillRecord.details) {
            const prevDetail = prevBillRecord.details.find(d => d.code === household.code);
            if (prevDetail && prevDetail.newReading !== undefined && prevDetail.newReading !== '') {
                oldReading = formatNumber(prevDetail.newReading);
            }
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Mã Hộ"><input type="text"  value="${household.code}" disabled/> </td>
          <td data-label="Số cũ"><input type="text" class="old-reading format-number" value="${oldReading}" placeholder="Nhập số cũ" ${oldReading ? 'readonly' : ''} /></td>
          <td data-label="Số mới"><input type="text" class="new-reading format-number" placeholder="Nhập số mới" /></td>
          <td data-label="Điện tiêu thụ" class="consumption"><input type="text"  value="0" disabled/></td>
          <td data-label="Thành tiền" class="amount"><input type="text"  value="0" disabled/></td>
        `;
        tbody.appendChild(tr);
    });

    validateElectricityInputs();
}

// Hàm tính toán điện tiêu thụ và thành tiền cho từng hộ
function computeBillAmounts() {
    const billMonth = document.getElementById('bill-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    // Loại bỏ dấu phẩy trước khi chuyển sang số (dùng regex /,/g để chỉ thay thế dấu phẩy)
    const managementFee = Number(document.getElementById('management-fee').value.replace(/./g, ""));
    const totalAmount = Number(document.getElementById('total-amount').value);
    console.log("document.getElementById('total-amount').value",document.getElementById('total-amount').value);
    

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
        // Cập nhật giá trị vào input của ô "Điện tiêu thụ"
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

    // Tính thành tiền cho từng hộ theo tỷ lệ điện tiêu thụ
    // Tính giá 1 kWh dựa trên tổng tiền và tổng điện tiêu thụ
    console.log("totalAmount", totalAmount);
    console.log("totalConsumption", totalConsumption);
    const kwh_amount = totalAmount / totalConsumption;

    // Gán giá trị kwh_amount vào ô input có id 'kwh-amount'
    // Lưu ý: sử dụng .value để gán giá trị cho input element
    document.getElementById('kwh-amount').value = formatNumber(kwh_amount);

    // Tính thành tiền cho từng hộ dựa trên điện tiêu thụ của hộ đó
    // Công thức: (kwh_amount + managementFee) * detail.consumption
    billData = billData.map(detail => {
        const amount = (kwh_amount + managementFee) * detail.consumption;
        return { ...detail, amount: Math.round(amount * 100) / 100 };
    });
    console.log("billData", billData);


    // Cập nhật giá trị vào input của ô "Thành tiền"
    rows.forEach((row, index) => {
        const amountInput = row.querySelector('.amount input');
        if (amountInput) {
            amountInput.value = formatNumber(billData[index].amount);
        }
    });

    // Lưu bản ghi bill vào localStorage để dùng cho tháng sau
    const bills = getBills();
    const billRecord = {
        month: billMonth,
        managementFee: managementFee,
        kwh_amount:kwh_amount,
        totalAmount: totalAmount,
        details: billData
    };
    const existingIndex = bills.findIndex(b => b.month === billMonth);
    if (existingIndex !== -1) {
        bills[existingIndex] = billRecord;
    } else {
        bills.push(billRecord);
    }
    setBills(bills);
    alert('Tính toán thành công!');
}

// Hàm format số có dấu phẩy (ví dụ: 10000 -> 10,000)
function formatNumber(num) {
    if (isNaN(num) || num === "") return num;
    return Number(num).toLocaleString();
}

/* ---------------- Các hàm khác (xem báo cáo, gửi thông báo) ---------------- */
function viewReport() {
    alert('Chức năng xem báo cáo chưa được triển khai đầy đủ.');
}
function sendNotifications() {
    alert('Chức năng gửi thông báo chưa được triển khai.');
}

// ---------- Quản lý hộ tham gia ----------

// Sinh mã hộ dựa trên tên (lấy chữ cái đầu của mỗi từ, nếu trùng thì cộng số thứ tự)
function generateHouseholdCode(name) {
    let code = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    const households = getHouseholds();
    let duplicateCount = households.filter(h => h.code.startsWith(code)).length;
    if (duplicateCount > 0) {
        code += (duplicateCount + 1);
    }
    return code;
}

// Hiển thị danh sách hộ trên bảng
function loadHouseholds() {
    const households = getHouseholds();
    const tbody = document.getElementById('household-list');
    tbody.innerHTML = '';
    households.forEach(household => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${household.code}</td>
                      <td>${household.name}</td>
                      <td>${household.hecta}</td>
                      <td>${household.joinDate}</td>
                      <td>${household.status}</td>
                      <td>${household.email}</td>
                      <td>
                        <button onclick="editHousehold('${household.code}')">Sửa</button>
                        <button onclick="changeStatusHousehold('${household.code}')">Đổi trạng thái</button>
                      </td>`;
        tbody.appendChild(tr);
    });
}

// Thêm mới hộ tham gia
function addHousehold() {
    const name = prompt('Nhập họ tên hộ:');
    if (!name) return;
    const hecta = prompt('Nhập số hecta:');
    const joinDate = prompt('Nhập ngày tham gia (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    const status = prompt('Nhập trạng thái (Active/Inactive):', 'Active');
    const email = prompt('Nhập email:');
    const code = generateHouseholdCode(name);
    const households = getHouseholds();
    households.push({ code, name, hecta, joinDate, status, email });
    setHouseholds(households);
    loadHouseholds();
}

// Sửa thông tin hộ
function editHousehold(code) {
    const households = getHouseholds();
    const index = households.findIndex(h => h.code === code);
    if (index === -1) return;
    const household = households[index];
    const name = prompt('Sửa họ tên hộ:', household.name);
    const hecta = prompt('Sửa số hecta:', household.hecta);
    const joinDate = prompt('Sửa ngày tham gia (YYYY-MM-DD):', household.joinDate);
    const email = prompt('Sửa email:', household.email);
    if (name) household.name = name;
    if (hecta) household.hecta = hecta;
    if (joinDate) household.joinDate = joinDate;
    if (email) household.email = email;
    households[index] = household;
    setHouseholds(households);
    loadHouseholds();
}

// Đổi trạng thái hộ (toggle Active/Inactive)
function changeStatusHousehold(code) {
    const households = getHouseholds();
    const index = households.findIndex(h => h.code === code);
    if (index === -1) return;
    const household = households[index];
    household.status = (household.status.toLowerCase() === 'active') ? 'Inactive' : 'Active';
    households[index] = household;
    setHouseholds(households);
    loadHouseholds();
}

// ---------- Xem Báo Cáo ----------

function viewReport() {
    const monthInput = document.getElementById('report-month').value;
    const reportDiv = document.getElementById('report-results');
    reportDiv.innerHTML = '';
    if (!monthInput) {
        reportDiv.innerHTML = '<p>Vui lòng chọn tháng/năm để xem báo cáo.</p>';
        return;
    }
    const bills = getBills();
    const billRecord = bills.find(b => b.month === monthInput);
    if (!billRecord) {
        reportDiv.innerHTML = `<p>Không có dữ liệu báo cáo cho tháng ${monthInput}.</p>`;
        return;
    }

    let html = `<h3>Báo cáo tháng ${monthInput}</h3>`;
    html += `<p>Phí quản lý: ${billRecord.managementFee}</p>`;
    html += `<p>Tổng tiền trong tháng: ${billRecord.totalMonthlyAmount}</p>`;
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
    billRecord.details.forEach(detail => {
        html += `<tr ${detail.missing ? 'class="highlight"' : ''}>
                 <td>${detail.code}</td>
                 <td>${detail.oldReading}</td>
                 <td>${detail.newReading}</td>
                 <td>${detail.consumption}</td>
                 <td>${detail.amount}</td>
               </tr>`;
    });
    html += `</tbody></table>`;
    reportDiv.innerHTML = html;
}

// ---------- Gửi Thông Báo ----------

function sendNotifications() {
    const monthInput = document.getElementById('notification-month').value;
    if (!monthInput) {
        alert('Vui lòng chọn tháng/năm để gửi thông báo.');
        return;
    }
    const bills = getBills();
    const billRecord = bills.find(b => b.month === monthInput);
    if (!billRecord) {
        alert(`Không có dữ liệu cho tháng ${monthInput} để gửi thông báo.`);
        return;
    }
    // Giả lập gửi email: Duyệt từng hộ và in thông tin ra console
    const households = getHouseholds();
    billRecord.details.forEach(detail => {
        const household = households.find(h => h.code === detail.code);
        if (household) {
            console.log(`Gửi thông báo tới ${household.email}:
  Phí quản lý: ${billRecord.managementFee}
  Tổng tiền: ${billRecord.totalMonthlyAmount}
  Điện tiêu thụ: ${detail.consumption}
  Thành tiền: ${detail.amount}`);
            // Tại đây, bạn có thể tích hợp API gửi email thực tế
        }
    });
    alert('Thông báo đã được gửi (giả lập).');
}
