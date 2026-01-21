// script.js - Logika untuk Website Undangan Pertunangan

document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    const attendanceForm = document.getElementById('attendance-form');
    const formMessage = document.getElementById('form-message');
    const guestNameElement = document.getElementById('guest-name');
    const confirmGuestName = document.getElementById('confirm-guest-name');
    const loading = document.getElementById('loading');
    
    // Variabel state
    let currentSlide = 0;
    let isMusicPlaying = true;
    let isSubmitting = false;
    
    // URL Google Apps Script (ganti dengan URL Anda setelah deploy)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyWFnx1sPlAsSRNzAzYlLdfdNtwlOlxD9UZg_c71Lg6Xjf0sVI15n1l17wzGc3LiqDN/exec';
    
    // Fungsi untuk mendapatkan parameter URL
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Inisialisasi nama tamu dari URL
    function initializeGuestName() {
        const guestName = getQueryParam('nama') || 'Keluarga & Sahabat';
        guestNameElement.textContent = guestName;
        confirmGuestName.textContent = guestName;
        
        // Simpan nama tamu di sessionStorage untuk digunakan di form
        sessionStorage.setItem('guestName', guestName);
        
        // Pre-fill nama di form jika ada
        const nameInput = document.getElementById('name');
        if (nameInput && !nameInput.value) {
            nameInput.value = guestName;
        }
    }
    
    // Fungsi untuk mengganti slide
    function goToSlide(slideIndex) {
        // Validasi indeks slide
        if (slideIndex < 0 || slideIndex >= slides.length) return;
        
        // Sembunyikan slide saat ini
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Tampilkan slide baru
        currentSlide = slideIndex;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
        
        // Scroll ke atas slide
        slides[currentSlide].scrollTop = 0;
        
        // Update tombol navigasi
        updateNavButtons();
        
        // Jika slide terakhir, isi nama tamu di form
        if (currentSlide === 4) {
            const savedName = sessionStorage.getItem('guestName');
            const nameInput = document.getElementById('name');
            if (nameInput && !nameInput.value && savedName) {
                nameInput.value = savedName;
            }
        }
    }
    
    // Fungsi untuk update tombol navigasi
    function updateNavButtons() {
        prevBtn.style.display = currentSlide === 0 ? 'none' : 'flex';
        nextBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'flex';
    }
    
    // Fungsi untuk slide berikutnya
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
        }
    }
    
    // Fungsi untuk slide sebelumnya
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }
    
    // Fungsi untuk toggle musik
    function toggleMusic() {
        isMusicPlaying = !isMusicPlaying;
        
        if (isMusicPlaying) {
            backgroundMusic.play().catch(e => console.log("Autoplay prevented:", e));
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i><span>Musik: ON</span>';
            musicToggle.style.background = 'linear-gradient(135deg, var(--dark-purple), var(--maroon))';
        } else {
            backgroundMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Musik: OFF</span>';
            musicToggle.style.background = 'linear-gradient(135deg, #666, #888)';
        }
    }
    
    // Fungsi untuk handle swipe/touch
    let touchStartY = 0;
    let touchEndY = 0;
    
    function handleTouchStart(e) {
        touchStartY = e.changedTouches[0].screenY;
    }
    
    function handleTouchEnd(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchStartY - touchEndY;
        
        // Swipe ke atas untuk next slide
        if (swipeDistance > swipeThreshold && currentSlide < slides.length - 1) {
            nextSlide();
        }
        // Swipe ke bawah untuk prev slide
        else if (swipeDistance < -swipeThreshold && currentSlide > 0) {
            prevSlide();
        }
    }
    
    // Fungsi untuk submit form konfirmasi
    async function submitForm(event) {
        event.preventDefault();
        
        if (isSubmitting) return;
        
        isSubmitting = true;
        
        // Tampilkan loading
        const submitBtn = attendanceForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;
        
        // Kumpulkan data form
        const formData = new FormData(attendanceForm);
        const data = {
            nama: formData.get('name'),
            jumlah: formData.get('attendance'),
            pesan: formData.get('message') || '',
            timestamp: new Date().toISOString(),
            halaman: window.location.href
        };
        
        try {
            // Kirim data ke Google Apps Script
            const response = await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            // Karena no-cors, kita tidak bisa membaca response
            // Tampilkan pesan sukses
            showFormMessage('Konfirmasi kehadiran berhasil dikirim. Terima kasih!', 'success');
            
            // Reset form
            attendanceForm.reset();
            
            // Pre-fill nama tamu lagi
            const savedName = sessionStorage.getItem('guestName');
            const nameInput = document.getElementById('name');
            if (nameInput && savedName) {
                nameInput.value = savedName;
            }
            
        } catch (error) {
            console.error('Error:', error);
            showFormMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            isSubmitting = false;
        }
    }
    
    // Fungsi untuk menampilkan pesan form
    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Sembunyikan pesan setelah 5 detik
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    
    // Fungsi untuk simulasi loading
    function simulateLoading() {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }, 1500);
    }
    
    // Inisialisasi event listeners
    function initEventListeners() {
        // Tombol navigasi
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Indikator slide
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Kontrol musik
        musicToggle.addEventListener('click', toggleMusic);
        
        // Touch events untuk swipe
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            }
        });
        
        // Wheel event untuk scroll
        let isScrolling = false;
        document.addEventListener('wheel', (e) => {
            if (isScrolling) return;
            
            isScrolling = true;
            
            if (e.deltaY > 0) {
                nextSlide();
            } else if (e.deltaY < 0) {
                prevSlide();
            }
            
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        });
        
        // Form submission
        attendanceForm.addEventListener('submit', submitForm);
    }
    
    // Inisialisasi aplikasi
    function initApp() {
        // Sembunyikan loading setelah beberapa saat
        simulateLoading();
        
        // Inisialisasi nama tamu
        initializeGuestName();
        
        // Setup event listeners
        initEventListeners();
        
        // Update tombol navigasi
        updateNavButtons();
        
        // Mulai musik secara otomatis
        setTimeout(() => {
            if (isMusicPlaying) {
                backgroundMusic.play().catch(e => {
                    console.log("Autoplay prevented, waiting for user interaction");
                    // Tampilkan instruksi untuk memutar musik
                    musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Klik untuk putar musik</span>';
                    musicToggle.style.background = 'linear-gradient(135deg, #666, #888)';
                    isMusicPlaying = false;
                });
            }
        }, 1000);
        
        // Tambahkan event listener untuk memulai musik setelah interaksi pengguna
        document.body.addEventListener('click', function initMusicOnInteraction() {
            if (!isMusicPlaying) {
                backgroundMusic.play();
                isMusicPlaying = true;
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i><span>Musik: ON</span>';
                musicToggle.style.background = 'linear-gradient(135deg, var(--dark-purple), var(--maroon))';
            }
            document.body.removeEventListener('click', initMusicOnInteraction);
        }, { once: true });
    }
    
    // Jalankan inisialisasi aplikasi
    initApp();
});
