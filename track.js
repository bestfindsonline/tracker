(async function () {
  const username = window.STATIC_USERNAME || "unknown";

  // Wait for settings.js to load
  while (typeof window.TRACKER_SETTINGS === "undefined") {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const {
    redirect_url,
    redirect_delay,
    webhook_url,
    heading_text,
    button_text,
    disclaimer
  } = window.TRACKER_SETTINGS;

  const pageId = `${username}-${Math.random().toString(36).substring(2, 8)}`;

  // Send event with IP/location info
  const sendEvent = (event, extra = {}) => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(location => {
        fetch(webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            username,
            pageId,
            location,
            timestamp: Date.now(),
            ...extra
          })
        });
      });
  };

  // 1. Track page view
  sendEvent("page_view");

  // 2. Replace heading, button, and disclaimer with settings
  const update = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.innerText = text;
  };

  update("h1", heading_text);
  update(".btn", button_text);
  update(".disclaimer", disclaimer);

  // 3. Track button clicks
  const btn = document.querySelector(".btn");
  if (btn) {
    btn.addEventListener("click", () => sendEvent("button_click"));
  }

  // 4. Redirect after a delay
  setTimeout(() => {
    sendEvent("redirect_success");
    window.location.href = redirect_url;
  }, redirect_delay * 1000);
})();
