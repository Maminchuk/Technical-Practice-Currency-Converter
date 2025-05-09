// change-txt.js
document.addEventListener('DOMContentLoaded', function() {
    const promoText = document.querySelector('.promo-text');
    if (!promoText) return;

    // Додаємо CSS для анімацій
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
        // Початок анімації зникнення
        promoText.classList.add('fade-out');
        
        // Після завершення анімації зникнення
        setTimeout(() => {
            // Зміна тексту
            currentIndex = (currentIndex + 1) % textVariants.length;
            promoText.textContent = textVariants[currentIndex];
            
            // Початок анімації появи
            promoText.classList.remove('fade-out');
            promoText.classList.add('fade-in');
            
            // Після завершення анімації появи
            setTimeout(() => {
                promoText.classList.remove('fade-in');
            }, 500);
        }, 500); // Час має збігатися з тривалістю CSS-анімації
    }

    // Початкова анімація (опціонально)
    setTimeout(() => {
        promoText.classList.add('fade-in');
        setTimeout(() => {
            promoText.classList.remove('fade-in');
        }, 500);
    }, 100);

    // Змінюємо текст кожні 5 секунд
    setInterval(changeText, 5000);
});