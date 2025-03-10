// --------------------- Khi trang DOM đã tải xong ---------------------
let curBills
let select_households = ''
let select_payment = ''
let dataChangePayment = []
document.addEventListener('DOMContentLoaded', () => {
    setNavigationSection();
    setDefaultMonth();
    setDefaultSelectHouseHold('ACTIVE');
    setDefaultSelectPayment('NO')
    loadHouseholds(); // Load danh sách hộ khi trang tải
    setShowPaymentBtn('none')

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

function setDefaultSelectHouseHold(type) {
    let activeBtn = document.querySelector('button[onclick="getActiveHousehold()"]');
    let unactiveBtn = document.querySelector('button[onclick="getUnActiveHousehold()"]');
    let addHouseholdBtn = document.getElementById("addHousehold");

    if (type === "ACTIVE") {
        activeBtn.classList.add("active");
        unactiveBtn.classList.remove("active");
        addHouseholdBtn.style.display = "block"; // Hiện nút "Thêm mới"
    } else if (type === "UNACTIVE") {
        unactiveBtn.classList.add("active");
        activeBtn.classList.remove("active");
        addHouseholdBtn.style.display = "none"; // Ẩn nút "Thêm mới"
    }
    select_households = type
}

function getActiveHousehold() {
    select_households = 'ACTIVE'
    setDefaultSelectHouseHold(select_households)
    loadHouseholds(select_households);
}

function getUnActiveHousehold() {
    select_households = 'UNACTIVE'
    setDefaultSelectHouseHold(select_households)
    loadHouseholds(select_households);
}

function setDefaultSelectPayment(type) {
    let activeBtn = document.querySelector('button[onclick="getPayment()"]');
    let unactiveBtn = document.querySelector('button[onclick="getNotPayment()"]');
    if (type === "YES") {
        activeBtn.classList.add("active");
        unactiveBtn.classList.remove("active");
    } else if (type === "NO") {
        unactiveBtn.classList.add("active");
        activeBtn.classList.remove("active");
    }
    select_payment = type
}

function setShowPaymentBtn(status) {
    // console.log("setShowPaymentBtn", status)
    let savePaymentBtn = document.getElementById("save-payment");
    savePaymentBtn.style.display = status;
}

function getNotPayment() {
    select_payment = 'NO'
    setDefaultSelectPayment(select_payment)
    loadPayment(select_payment);
}
function getPayment() {
    select_payment = 'YES'
    setDefaultSelectPayment(select_payment)
    loadPayment(select_payment);
}
// --------------------- Các hàm lưu trữ dữ liệu qua Google Sheets ---------------------
// Chú ý: Thay đổi SCRIPT_URL thành URL Web App đã triển khai từ Render
// const SCRIPT_URL = "https://electricity-management-server.onrender.com/api";
const SCRIPT_URL = " http://localhost:3000/api"
// Lấy danh sách HOUSESHOLDS từ Google Sheets
async function getHouseholds(type) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/getHouseholds/${type}`);
        const rs = await response.json();
        isLoading(false)
        if (rs.success) return rs.data; // Trả về mảng đối tượng
        else return []
    } catch (error) {
        isLoading(false)
        console.error("Error fetching households:", error);
        return [];
    }
}
// Thêm mới
async function callAddHouseholds(household) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/addHouseholds`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(household)
        });
        console.log("Response:", response);
        isLoading(false)

    } catch (error) {
        isLoading(false)
        console.error("Error setting households:", error);
    }
}
//Chỉnh sửa
async function callEditHouseholds(household) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/editHouseholds`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(household)
        });
        console.log("Response:", response);
        isLoading(false)
    } catch (error) {
        isLoading(false)
        console.error("Error setting households:", error);
    }
}

// Lấy danh sách BILLS từ Google Sheets
async function getBills(strMonth) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/getBills/${strMonth}`);
        const rs = await response.json();
        isLoading(false)
        isSave(false)
        if (rs.success) {
            curBills = rs.data;
            return rs.data;
        }
        else return []
    } catch (error) {
        isLoading(false)
        console.error("Error fetching bills:", error);
        return [];
    }
}

// Ghi danh sách BILLS vào Google Sheets
async function setBills(bills) {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/submitBills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bills)
        });

        // const result = await response.text();
        console.log(response);
        isLoading(false)
        isSave(false)
        return result;
    } catch (error) {
        isLoading(false)
        console.error('Error:', error);
        throw error;
    }
}

//Báo cáo
async function getDataRpt(type, input) {
    isLoading(true);
    try {
        let api = "";
        let v_input = "";

        switch (type) {
            case "overview":
                api = "getOverviewBill";
                break;
            case "month-detail":
                api = "getDetailBillByMonth";
                v_input = `/${input}`;
                break;
            case "customers":
                api = "getDetailBillByCustomer";
                v_input = `/${input}`;
                break;
            default:
                isLoading(false);
                return []; // Trả về mảng rỗng nếu type không hợp lệ
        }

        const response = await fetch(`${SCRIPT_URL}/${api}${v_input}`);
        const rs = await response.json();

        isLoading(false);

        return rs.success ? rs.data : [];
    } catch (error) {
        isLoading(false);
        console.error("Error fetching data report:", error);
        return [];
    }
}

// Lấy danh sách Payment từ Google Sheets
async function getDataPayment(strMonth, status) {
    isLoading(true)
    try {
        let url = status == 'YES' ? 'getPaymentByMonth' : 'getNotPaymentByMonth';

        const response = await fetch(`${SCRIPT_URL}/${url}/${strMonth}`);
        const rs = await response.json();
        isLoading(false)
        if (rs.success) {
            return rs.data;
        }
        else return []
    } catch (error) {
        isLoading(false)
        console.error("Error fetching payments:", error);
        return [];
    }
}

// Lấy danh sách Payment từ Google Sheets
async function setDataPayment() {
    isLoading(true)
    try {
        const response = await fetch(`${SCRIPT_URL}/editPayment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataChangePayment)
        });

        const result = await response.text();
        console.log(response);
        isLoading(false)
        dataChangePayment = []
        return result;
    } catch (error) {
        isLoading(false)
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
function convertMonth2(dateString) {
    // Create a new Date object
    const date = new Date(dateString);

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Format the date as dd/mm/yyyy
    const formattedDate = `${month}/${year}`
    return formattedDate;
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
function getCurrentDate() {
    const date = new Date();

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Format the date as dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`
    return formattedDate;
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
    if (event.target.classList.contains('custom-checkbox')) {
        const checkbox = event.target;
        const itemID = checkbox.closest('tr').querySelector('input[type="text"]').value;
        const isChecked = checkbox.checked ? 'Y' : 'N';
        const billMonth = document.getElementById('payment-month').value;

        let strMonth = convertMonth(billMonth)

        console.log(`Payment status for ${itemID} changed to: ${isChecked}`);

        // Update the dataChangePayment array
        const existingItem = dataChangePayment.find(payment => payment.ID === itemID);
        if (existingItem) {
            existingItem.ISPAYMENT = isChecked;
        } else {
            dataChangePayment.push({ ID: itemID, ISPAYMENT: isChecked, MONTH: strMonth });
        }

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
        const amount = Math.round((kwh_amount + managementFee) * detail.CONSUMPTION);
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
    console.log("curBills", curBills);
    alert('Tính toán thành công!');
}

async function submitSave() {
    await setBills(curBills)
    alert('Lưu dữ liệu thành công!');
}
// --------------------- Quản lý hộ ---------------------
async function loadHouseholds() {
    const households = await getHouseholds(select_households);
    const tbody = document.getElementById('household-list');
    tbody.innerHTML = '';
    if (households.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td data-label="Không có dữ liệu"></td>`
        tbody.appendChild(tr);
    } else {
        households.forEach(household => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td data-label="Mã Hộ"><input type="text" value="${household.ID}" disabled class="custom-disabled" /></td>
        <td data-label="Họ tên"><input type="text" value="${household.FULLNAME}" disabled  class="active-household custom-disabled"/></td>
        <td data-label="Nhóm"><input type="text" value="${household.GROUP}" disabled  class="active-household custom-disabled"/></td>
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
}

async function addHousehold() {
    const name = prompt('Nhập họ tên hộ:');
    if (!name) return;
    const group = prompt('Nhập Nhóm (1/2/3):');
    const hecta = prompt('Nhập số hecta:');
    const joinDate = prompt('Nhập ngày tham gia (DD/MM/YYYY):', getCurrentDate());
    const status = prompt('Nhập trạng thái (Hoạt động/Không hoạt động):', 'Hoạt động');
    const email = prompt('Nhập email:');
    let item = { FULLNAME: name, HECTA: hecta, JOINDATE: joinDate, STATUS: status, EMAIL: email, GROUP: group };
    await callAddHouseholds(item);
    alert('Lưu dữ liệu thành công!');
    loadHouseholds();
}

async function editHousehold(code) {
    let households = await getHouseholds(select_households);
    const index = households.findIndex(h => h.ID === code);
    if (index === -1) return;
    let household = households[index];
    const name = prompt('Sửa họ tên hộ:', household.FULLNAME);
    const group = prompt('Sửa nhóm:', household.GROUP);
    const hecta = prompt('Sửa số hecta:', household.HECTA);
    const joinDate = prompt('Sửa ngày tham gia (DD/MM/YYYY):', convertDate(household.JOINDATE));
    const email = prompt('Sửa email:', household.EMAIL);
    if (name) household.FULLNAME = name;
    if (hecta) household.HECTA = hecta;
    if (joinDate) household.JOINDATE = joinDate;
    if (email) household.EMAIL = email;
    if (group) household.GROUP = group;

    await callEditHouseholds(household);
    alert('Cập nhật dữ liệu thành công!');

    loadHouseholds();
}

async function changeStatusHousehold(code) {
    let households = await getHouseholds(select_households);
    const index = households.findIndex(h => h.ID === code);
    if (index === -1) return;
    let household = households[index];
    household.STATUS = (household.STATUS.toLowerCase() === 'hoạt động') ? 'Không hoạt động' : 'Hoạt động';
    households[index] = household;
    await callEditHouseholds(household);
    alert('Đổi trạng thái thành công!');
    loadHouseholds();
}

// --------------------- Báo cáo ---------------------
function resetFrontRpt() {
    const tbody = document.getElementById('report-results');
    tbody.innerHTML = '';
    let submitButton = document.querySelector("#info-month-detail");
    if (submitButton) {
        submitButton.style.display = "none";
    }
}

document.getElementById("report-type").addEventListener("change", function () {
    resetFrontRpt()
    const selectedReport = this.value;
    const inputReports = document.getElementById("input-reports");

    // Xóa nội dung cũ
    inputReports.innerHTML = "";

    if (selectedReport === "month-detail") {
        let today = new Date();
        let year = today.getFullYear();
        let month = (today.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo 2 chữ số
        let currentMonth = `${year}-${month}`;

        // Hiển thị input chọn tháng
        inputReports.innerHTML = `
            <input type="month" id="report-month" value="${currentMonth}" />
        `;
    } else if (selectedReport === "customers") {
        // Hiển thị ô nhập mã khách hàng
        inputReports.innerHTML = `
            <input type="text" id="customer-id" placeholder="Nhập mã khách hàng" />
        `;
    }
});

function genRpt(type, data) {
    console.log(type, data);

    const tbody = document.getElementById('report-results');
    tbody.innerHTML = '';
    if (data.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td data-label="Không có dữ liệu"></td>`
        tbody.appendChild(tr);
    } else {
        data.forEach(item => {
            const tr = document.createElement('tr');
            if (type == 'overview') {
                tr.innerHTML = `
        <td data-label="Tháng"><input type="text" value="${convertMonth2(item.MONTH)}" disabled class="active-household  custom-disabled" /></td>
         <td data-label="Phí quản lý/kwh"><input type="text" value="${formatNumber(item.MANAFEE)}" disabled  class="format-number custom-disabled"/></td>
          <td data-label="Giá 1kwh"><input type="text" value="${formatNumber(item.KWH_AMOUNT)}" disabled  class="format-number custom-disabled"  /></td>
           <td data-label="Tổng tiền"><input type="text" value="${formatNumber(item.TOTAL_AMOUNT)}" disabled  class="format-number custom-disabled"  /></td>
            <td data-label="Tổng điện tiêu thụ "><input type="text" value="${formatNumber(item.TOTAL_COMSUMPTION)}" disabled   class="format-number custom-disabled" /></td>
             <td data-label="Số hộ tham gia"><input type="text" value="${formatNumber(item.NUM_PARTICIPATE)}" disabled  class="format-number custom-disabled"  /></td>
                     `;
            }
            else if (type === "month-detail") {
                let submitButton = document.querySelector("#info-month-detail");
                if (submitButton) {
                    submitButton.style.display = "block";
                }
                const monthInput = document.getElementById('rpt-month');
                if (monthInput) {
                    monthInput.value = convertMonth2(item.MONTH);
                }

                const totalAmountInput = document.getElementById('rpt-total-amount');
                if (totalAmountInput) {
                    totalAmountInput.value = formatNumber(item.TOTAL_AMOUNT);
                }

                const khwTotalInput = document.getElementById('rpt-kwh-total');
                if (khwTotalInput) {
                    khwTotalInput.value = formatNumber(item.TOTAL_AMOUNT);
                }

                const manaFeeInput = document.getElementById('rpt-management-fee');
                if (manaFeeInput) {
                    manaFeeInput.value = formatNumber(item.MANAFEE);
                }

                const khwAmonthInput = document.getElementById('rpt-kwh-amount');
                if (khwAmonthInput) {
                    khwAmonthInput.value = formatNumber(item.KWH_AMOUNT);
                }


                tr.innerHTML = `
              <td data-label="Mã hộ"><input type="text" value="${item.ID}" disabled  class="custom-disabled"  /></td>
                 <td data-label="Số điện sử dụng"><input type="text" value="${formatNumber(item.CONSUMPTION)}" disabled  class="format-number custom-disabled"  /></td>
                 <td data-label="Số tiền phải đóng"><input type="text" value="${formatNumber(item.AMOUNT)}" disabled  class="format-number custom-disabled"  /></td>
                         `;
            }
            else if (type === "customers") {
                tr.innerHTML = `
            <td data-label="Tháng"><input type="text" value="${convertMonth2(item.MONTH)}" disabled class="active-household  custom-disabled" /></td>
              <td data-label="Mã hộ"><input type="text" value="${item.ID}" disabled  class="custom-disabled"  /></td>
                 <td data-label="Số cũ"><input type="text" value="${formatNumber(item.OLD_NUMBER)}" disabled  class="format-number custom-disabled"  /></td>
                 <td data-label="Số mới"><input type="text" value="${formatNumber(item.NEW_NUMBER)}" disabled  class="format-number custom-disabled"  /></td>
                 <td data-label="Số điện sử dụng"><input type="text" value="${formatNumber(item.CONSUMPTION)}" disabled  class="format-number custom-disabled"  /></td>
                 <td data-label="Số tiền phải đóng"><input type="text" value="${formatNumber(item.AMOUNT)}" disabled  class="format-number custom-disabled"  /></td>
                         `;

            }
            tbody.appendChild(tr);
        });
    }

}

async function viewReport() {
    let v_select = document.getElementById("report-type").value;
    let v_input = "";

    if (v_select === "month-detail") {
        v_input = document.getElementById("report-month")?.value || "";
        v_input = convertMonth(v_input)
        if (!v_input) {
            alert("Vui lòng chọn tháng để xem báo cáo!");
            return;
        }
    } else if (v_select === "customers") {
        v_input = document.getElementById("customer-id")?.value.trim() || "";
        if (!v_input) {
            alert("Vui lòng nhập mã khách hàng!");
            return;
        }
    }

    // Gọi API nếu dữ liệu hợp lệ
    let data = await getDataRpt(v_select, v_input);
    genRpt(v_select, data)
}


// --------------------- Gửi thông báo ---------------------
async function loadPayment() {
    const billMonth = document.getElementById('payment-month').value;
    if (!billMonth) {
        alert('Vui lòng chọn tháng.');
        return;
    }
    let strMonth = convertMonth(billMonth)

    const dataPayment = await getDataPayment(strMonth, select_payment)

    const tbody = document.getElementById('dataPayment');
    tbody.innerHTML = '';
    if (dataPayment.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td data-label="Không có dữ liệu"></td>`
        tbody.appendChild(tr);
    } else {
        dataPayment.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td data-label="Mã Hộ"><input type="text" value="${item.ID}" disabled class="custom-disabled" /></td>
        <td data-label="Họ tên"><input type="text" value="${item.FULLNAME}" disabled  class="active-household custom-disabled"/></td>
        <td data-label="Số điện tiêu thụ"><input type="text" value="${formatNumber(item.CONSUMPTION)}" disabled  class="custom-disabled"  /></td>
        <td data-label="Số tiền/kwh"><input type="text" value="${formatNumber(item.KWH_AMOUNT)}" disabled  class="custom-disabled"  /></td>
        <td data-label="Số tiền phải trả"><input type="text" value="${formatNumber(item.AMOUNT)}" disabled   class="custom-disabled" /></td>
        ${select_payment == 'NO' ?
                    `<td data-label="Thanh toán" class="highlight"><input type="checkbox" ${item.ISPAYMENT == 'Y' ? 'checked' : ''} class="custom-checkbox" /></td>`
                    : ''}       
        <td data-label="Link" class="flex">
            <div class="info">
                <a href="${item.LINK}" target="_blank">Thông tin hóa đơn</a>
                <button class="danger" onclick="copyDataPayment('${item.LINK}')" >Copy</button>
            </div>
        </td>
                `;
            tbody.appendChild(tr);

        })
    }

    if (select_payment == 'NO') setShowPaymentBtn('block')
    else setShowPaymentBtn('none')
}

async function savePayment() {
    if (dataChangePayment.length > 0) {
        await setDataPayment()
        await loadPayment()
    } else alert('Không có thay đổi nào, vui lòng kiểm tra lại!');
}

function copyDataPayment(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}