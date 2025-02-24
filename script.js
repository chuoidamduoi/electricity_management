// --------------------- Khi trang DOM đã tải xong ---------------------
let curBills
document.addEventListener('DOMContentLoaded', () => {
    loadHouseholds(); // Load danh sách hộ khi trang tải
    setNavigationSection();
    setDefaultMonth();
});

// --------------------- Navigation: Chuyển đổi giữa các section ---------------------
function setNavigationSection() {
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
};

// --------------------- Gán giá trị mặc định cho input type="month" ---------------------
function setDefaultMonth() {
    let today = new Date();
    let year = today.getFullYear();
    let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo 2 chữ số
    let currentMonth = `${year}-${month}`; // Updated format to match 'input[type="month"]' expected value
    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.value = currentMonth;
    });
};

// --------------------- Các hàm lưu trữ dữ liệu qua Google Sheets ---------------------
// Chú ý: Thay đổi SCRIPT_URL thành URL Web App đã triển khai từ Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7hH-zdEv4CLwrJDsryuviVQcwYWXaBTJxYeNRJRTQkmp8SWIk_51CUJndVNQVJ54u/exec";

// Lấy danh sách HOUSESHOLDS từ Google Sheets
async function getHouseholds() {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getHouseholds`);
        const households = await response.json();
        isLoading(false)
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
async function getBills(strMonth) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getBills&month=${strMonth}`);
        const bills = await response.json();
        curBills = bills
        isLoading(false)
        isSave(false)
        return bills;
    } catch (error) {
        console.error("Error fetching bills:", error);
        return [];
    }
}

// Ghi danh sách BILLS vào Google Sheets
async function setBills(bills) {
    
    isLoading(true)
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(bills);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
        mode: "cors",
    };

    try {
        const response = await fetch(`${SCRIPT_URL}?action=setBills`, requestOptions);
        // const result = await response.text();
        console.log(response);
        isLoading(false)
        isSave(false)
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// --------------------- Xử lý định dạng cho các input số ---------------------
// --------------------- Hàm định dạng số (thêm dấu phẩy) ---------------------
function formatNumber(num) {
    if (isNaN(num) || num === "") return num;
    return Number(num).toLocaleString();
}

// Khi blur: định dạng lại số có dấu phẩy
document.addEventListener("blur", function (e) {
    if (e.target.classList.contains("format-number")) {
        let val = e.target.value
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

function convertDate(dateString) {
    // Create a new Date object
    const date = new Date(dateString);

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Format the date as dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`
    return formattedDate;
}
function convertMonth(billMonth) {
    const date = new Date(billMonth);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    const formattedMonth = `${month}${year}`;
    return formattedMonth;
}

function convertNull(str) {
    return str == (null) ? '' : str
}

function isLoading(isLoading) {
    let submitButton = document.querySelector(".loading");
    if (submitButton) {
        submitButton.style.display = isLoading ? "flex" : "none";
    }
}
function isSave(isSave) {
    let submitButton = document.querySelector(".save-button");
    if (submitButton) {
        submitButton.style.display = isSave ? "block" : "none";
    }
}
// --------------------- Kiểm tra các ô input điện ---------------------
function validateElectricityInputs() {
    let inputs = document.querySelectorAll("#bill-list input");
    let rs = false
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            input.classList.add("error"); // Thêm màu đỏ nếu chưa nhập
        } else {
            input.classList.remove("error"); // Xóa màu đỏ nếu đã nhập
            rs = true
        }
    });
    if (rs) {
        // Thay đổi hiển thị của phần tử với class "submit-bills"
        let submitButton = document.querySelector(".submit-bills");
        if (submitButton) {
            submitButton.style.display = "block";
        }
    }
}

document.addEventListener("input", function (event) {
    if (event.target.closest("#bill-list")) {
        validateElectricityInputs();
    }
});
// --------------------- Quản lý điện ---------------------
async function loadElectricityForm() {
    const billMonth = document.getElementById('bill-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    let strMonth = convertMonth(billMonth)
    const bills = await getBills(strMonth);

    const tbody = document.getElementById('bill-list');
    tbody.innerHTML = '';
    bills.forEach(bill => {

        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td data-label="Mã Hộ"><input type="text" value="${bill.ID}" disabled class="id" /></td>
        <td data-label="Số cũ"><input type="text" class="old-reading format-number" value="${convertNull(bill.OLD_NUMBER)}" placeholder="Nhập số cũ" ${convertNull(bill.OLD_NUMBER) ? 'readonly' : ''} /></td>
        <td data-label="Số mới"><input type="text" class="new-reading format-number" value="${convertNull(bill.NEW_NUMBER)}" placeholder="Nhập số mới" ${convertNull(bill.NEW_NUMBER) ? 'readonly' : ''} /></td>
        <td data-label="Điện tiêu thụ" class="consumption"><input type="text" value="${convertNull(bill.CONSUMPTION)}" disabled  class="non-custom-disable"/></td>
        <td data-label="Thành tiền" class="amount"><input type="text" value="${convertNull(bill.AMOUNT)}" disabled  class="non-custom-disable"/></td>
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
    let strMonth = convertMonth(billMonth)
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
        const idInput = row.querySelector('.id');
        const oldReadingInput = row.querySelector('.old-reading');
        const newReadingInput = row.querySelector('.new-reading');
        const id = idInput.value
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
            ID: id,
            OLD_NUMBER: oldReading,
            NEW_NUMBER: newReading,
            CONSUMPTION: consumption,
            AMOUNT: 0,
        });
    });

    if (totalConsumption <= 0) {
        alert('Tổng điện tiêu thụ không hợp lệ.');
        return;
    }

    // Gán giá trị vào input có id 'kwh-total'
    const kwhTotaInput = document.getElementById('kwh-total');
    if (kwhTotaInput) {
        kwhTotaInput.value = formatNumber(totalConsumption);
    }

    // Tính giá 1 kWh
    const kwh_amount = Math.round(totalAmount / totalConsumption);
    // Gán giá trị vào input có id 'kwh-amount' (nếu có)
    const kwhAmountInput = document.getElementById('kwh-amount');
    if (kwhAmountInput) {
        kwhAmountInput.value = formatNumber(kwh_amount);
    }

    // Tính thành tiền cho từng hộ
    // Công thức: (kwh_amount + managementFee) * detail.consumption
    billData = billData.map(detail => {
        const amount = Math.round((kwh_amount + managementFee) * detail.consumption);
        return { ...detail, AMOUNT: Math.round(amount * 100) / 100 };
    });

    // Cập nhật ô "Thành tiền" cho từng hàng
    rows.forEach((row, index) => {
        const amountInput = row.querySelector('.amount input');
        if (amountInput) {
            amountInput.value = formatNumber(billData[index].AMOUNT);
        }
    });

    const billRecord = {
        MONTH: strMonth,
        MANAFEE: managementFee,
        TOTAL_AMOUNT: totalAmount,
        TOTAL_COMSUMPTION: totalConsumption,
        KWH_AMOUNT: kwh_amount,
        DETAILS: billData
    };
    curBills = billRecord;
    isSave(true)
    alert('Tính toán thành công!');
}

async function submitSave() {
    console.log("curBills", curBills);
    setBills(curBills).then(result => {
        console.log("Success:", result);
      }).catch(error => {
        console.error("Failed:", error);
      });
    alert('Lưu dữ liệu thành công!');
    // await loadElectricityForm() 
}

// --------------------- Quản lý hộ ---------------------
async function loadHouseholds() {
    const households = await getHouseholds();
    const tbody = document.getElementById('household-list');
    tbody.innerHTML = '';
    households.forEach(household => {
        const tr = document.createElement('tr');
        const v_class_status = household.STATUS ? (household.STATUS.toUpperCase() == 'HOẠT ĐỘNG' ? 'active-household' : '') : ''
        tr.innerHTML = `
        <td data-label="Mã Hộ"><input type="text" value="${household.ID}" disabled class="custom-disabled" /></td>
         <td data-label="Họ tên"><input type="text" value="${household.FULLNAME}" disabled  class="${v_class_status} custom-disabled"/></td>
          <td data-label="Số Hec"><input type="text" value="${household.HECTA}" disabled  class="custom-disabled"  /></td>
           <td data-label="Ngày thgia"><input type="text" value="${convertDate(household.JOINDATE)}" disabled  class="custom-disabled"  /></td>
            <td data-label="Trạng thái"><input type="text" value="${household.STATUS}" disabled   class="custom-disabled" /></td>
             <td data-label="Email"><input type="text" value="${household.EMAIL}" disabled  class="custom-disabled"  /></td>
                      <td id="mobile-btn">
                        <button onclick="editHousehold('${household.ID}')" class="warning">Sửa</button>
                        <button onclick="changeStatusHousehold('${household.ID}')" class="danger">Đổi trạng thái</button>
                      </td>`;
        tbody.appendChild(tr);
    });
}

async function addHousehold() {
    const name = prompt('Nhập họ tên hộ:');
    if (!name) return;
    const hecta = prompt('Nhập số hecta:');
    const joinDate = prompt('Nhập ngày tham gia (DD/MM/YYYY):', new Date().toISOString().slice(0, 10));
    const status = prompt('Nhập trạng thái (Hoạt động/Không hoạt động):', 'Hoạt động');
    const email = prompt('Nhập email:');
    const code = generateHouseholdCode(name);
    let households = await getHouseholds();
    households.push({ ID: code, FULLNAME: name, HECTA: hecta, JOINDATE: joinDate, STATUS: status, EMAIL: email });
    await setHouseholds(households);
    loadHouseholds();
}

function generateHouseholdCode(name) {
    let code = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    // code += Math.floor(Math.random() * 1000);
    return code;
}

async function editHousehold(code) {
    let households = await getHouseholds();
    const index = households.findIndex(h => h.ID === code);
    if (index === -1) return;
    let household = households[index];
    const name = prompt('Sửa họ tên hộ:', household.FULLNAME);
    const hecta = prompt('Sửa số hecta:', household.HECTA);
    const joinDate = prompt('Sửa ngày tham gia (DD/MM/YYYY):', convertDate(household.JOINDATE));
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
    household.STATUS = (household.STATUS.toLowerCase() === 'hoạt động') ? 'Không hoạt động' : 'Hoạt động';
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
