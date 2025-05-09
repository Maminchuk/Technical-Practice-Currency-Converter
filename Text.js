document.addEventListener('DOMContentLoaded', function() {
    const promoText = document.querySelector('.promo-text');
    if (!promoText) return;
    const style = document.createElement('style');
    style.textContent = `
        .promo-text {
            transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        }
        .promo-text.fade-out {
            opacity: 0;
            transform: translateY(-10px);
        }
        .promo-text.fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    const textVariants = [
        "Get favorable exchange rates in seconds!",
        "Fast and secure currency conversions!",
        "The best rates for your transactions!",
        "No hidden fees - honest exchange!",
        "Trusted by thousands of users!"
    ];
    let currentIndex = 0;
    function changeText() {
        promoText.classList.add('fade-out');
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % textVariants.length;
            promoText.textContent = textVariants[currentIndex];
            promoText.classList.remove('fade-out');
            promoText.classList.add('fade-in');
            setTimeout(() => {
                promoText.classList.remove('fade-in');
            }, 500);
        }, 500); 
    }
    setTimeout(() => {
        promoText.classList.add('fade-in');
        setTimeout(() => {
            promoText.classList.remove('fade-in');
        }, 500);
    }, 100);
    setInterval(changeText, 5000);
});