document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cfName").value.trim();
    const phone = document.getElementById("cfPhone").value.trim();
    const message = document.getElementById("cfMessage").value.trim();
    const msg = document.getElementById("contactFormMsg");

    const text = `New enquiry from Homes PK Marketing website:\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    window.open(waLink(BUSINESS.whatsappNumbers[0], text), "_blank");

    msg.textContent = "Thanks! Your message has been prepared on WhatsApp — hit send there to reach Kamran Abbasi directly.";
    msg.classList.add("show", "success");
    form.reset();
  });
});
