const BaseURL = 'https://critical-functionality-takes-playlist.trycloudflare.com';
document.getElementById("renderBtn").addEventListener("click", async () => {
    try {
        let token = localStorage.getItem("token");
        //  Send token in Authorization header
        const response = await fetch(`${BaseURL}/payment/pay`, {
            method: "POST",
            headers: {
        "Content-Type": "application/json",
        "Authorization":  token
    }
        });

        const data = await response.json();

        const paymentSessionId = data.paymentSessionId;

        let checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self",
        };

        await cashfree.checkout(checkoutOptions);

    } catch (err) {
        console.error("Error:", err);
    }
});