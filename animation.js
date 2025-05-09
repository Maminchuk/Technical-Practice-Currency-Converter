
document.addEventListener('DOMContentLoaded', function() {

    const startSection = document.querySelector('.start-section');
    const container = document.querySelector('.container');
    const goToConverterBtn = document.querySelector('.go-to-converter');
    
    setTimeout(() => {
        startSection.classList.add('active');
    }, 300);
    
    if (goToConverterBtn) {
        goToConverterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            container.classList.add('visible');
            
            document.querySelector('.converter-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
 window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const container = document.querySelector('.container');
    if (container && scrollPosition > document.querySelector('.start-section').offsetHeight * 0.3) {
        container.classList.add('visible');
    }
});
});