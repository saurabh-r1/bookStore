// Frontend/src/utils/loadRazorpay.js
export default function loadRazorpay(
  src = "https://checkout.razorpay.com/v1/checkout.js"
) {
  return new Promise((resolve) => {
    // If already loaded, reuse
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
