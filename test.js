async function callPostAPI() {
    const url = "https://electricity-management-server.onrender.com/api/submitBills";

    // Dữ liệu gửi đi (payload)
    const data = {
        "MONTH": "022025",
        "MANAFEE": 100,
        "TOTAL_AMOUNT": 900000,
        "TOTAL_COMSUMPTION": 54,
        "KWH_AMOUNT": 16667,
        "DETAILS": [
            {
                "ID": "NVS",
                "OLD_NUMBER": 11,
                "NEW_NUMBER": 23,
                "CONSUMPTION": 12,
                "AMOUNT": null
            },
            {
                "ID": "NVT780",
                "OLD_NUMBER": 1,
                "NEW_NUMBER": 43,
                "CONSUMPTION": 42,
                "AMOUNT": null
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("Response:", response);
        // Nếu cần kiểm tra nội dung response (lưu ý: ở no-cors, response là opaque nên không thể đọc được nội dung chi tiết)
        // const result = await response.text();
        // console.log("Result:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}


async function computeBillAmounts_TEST() {
    callPostAPI();

}
