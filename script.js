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
    
    // URL Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyWFnx1sPlAsSRNzAzYlLdfdNtwlOlxD9UZg_c71Lg6Xjf0sVI15n1l17wzGc3LiqDN/exec';
    
    // Fungsi untuk format nama dengan kapital setiap kata
    function formatName(name) {
        if (!name || typeof name !== 'string') return '';
        
        // Ubah ke huruf kecil dulu, lalu kapitalkan setiap kata
        return name.toLowerCase()
            .split(/[\s\-_\+\.]+/) // Pisah berdasarkan spasi, -, _, +, atau .
            .map(word => {
                // Skip kata penghubung yang pendek (biarkan huruf kecil)
                const shortWords = ['di', 'ke', 'dari', 'dan', 'atau', 'yang', 'untuk', 'pada', 'dengan'];
                if (shortWords.includes(word)) {
                    return word;
                }
                
                // Handle nama dengan apostrof (contoh: O'Brian)
                if (word.includes("'")) {
                    return word.split("'")
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                        .join("'");
                }
                
                // Kapitalkan kata biasa
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ')
            .trim();
    }
    
    // Fungsi untuk mendapatkan nama dari sessionStorage atau URL
    function getGuestName() {
        // Coba ambil dari sessionStorage dulu
        let guestName = sessionStorage.getItem('guestName');
        
        if (!guestName) {
            // Coba dari parameter URL
            const urlParams = new URLSearchParams(window.location.search);
            let rawName = urlParams.get('nama') || urlParams.get('name') || urlParams.get('to');
            
            // Jika tidak ada dari parameter, coba dari path setelah slash
            if (!rawName) {
                let path = window.location.pathname;
                // Hapus "/Diva-Eka-together/" dari path
                path = path.replace('/Diva-Eka-together/', '');
                path = path.replace('/Diva-Eka-together', '');
                path = path.replace('/', '');
                
                if (path) {
                    path = decodeURIComponent(path);
                    path = path.replace('.html', '');
                    rawName = path;
                }
            }
            
            // Format nama jika ada
            if (rawName) {
                guestName = formatName(rawName);
            } else {
                guestName = "Keluarga & Sahabat";
            }
            
            // Simpan di sessionStorage
            sessionStorage.setItem('guestName', guestName);
        }
        
        return guestName;
    }
    
    // Fungsi untuk mengatur nama tamu di seluruh halaman
    function setupGuestName() {
        const guestName = getGuestName();
        
        console.log('Setting guest name to:', guestName);
        
        // Update di Slide 2 (Undangan Untuk)
        if (guestNameElement) {
            guestNameElement.textContent = guestName;
        }
        
        // Update di Slide 5 (Konfirmasi)
        if (confirmGuestName) {
            confirmGuestName.textContent = guestName;
        }
        
        // Update judul halaman
        document.title = `Undangan Pertunangan - Untuk ${guestName}`;
        
        return guestName;
    }
    
    // Fungsi untuk mengatur nama di form (dipanggil saat slide berubah ke slide 5)
    function setupFormName() {
        const guestName = getGuestName();
        const nameInput = document.getElementById('name');
        
        if (nameInput && !nameInput.value) {
            nameInput.value = guestName;
        }
    }
    
    // FUNGSI BARU: Coba mulai musik dengan berbagai strategi
    function startBackgroundMusic() {
        if (!backgroundMusic) return;
        
        // Set volume (50% agar tidak terlalu keras)
        backgroundMusic.volume = 0.5;
        
        // Coba play musik
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Musik berhasil diputar
                    console.log('Musik berhasil dimulai');
                    isMusicPlaying = true;
                    updateMusicButton();
                })
                .catch(error => {
                    // Autoplay diblokir oleh browser
                    console.log('Autoplay diblokir:', error);
                    isMusicPlaying = false;
                    updateMusicButton();
                    
                    // Tampilkan instruksi
                    showMusicInstruction();
                });
        }
    }
    
    // FUNGSI BARU: Update tampilan tombol musik
    function updateMusicButton() {
        if (!musicToggle) return;
        
        if (isMusicPlaying) {
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i><span>Musik: ON</span>';
            musicToggle.style.background = 'linear-gradient(135deg, var(--dark-purple), var(--maroon))';
        } else {
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Musik: OFF</span>';
            musicToggle.style.background = 'linear-gradient(135deg, #666, #888)';
        }
    }
    
    // FUNGSI BARU: Tampilkan instruksi musik
    function showMusicInstruction() {
        // Tambahkan tooltip atau pesan
        const musicTooltip = document.createElement('div');
        musicTooltip.className = 'music-tooltip';
        musicTooltip.innerHTML = '<p><i class="fas fa-info-circle"></i> Klik tombol musik untuk memutar</p>';
        musicTooltip.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(139, 0, 0, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            z-index: 1001;
            animation: fadeIn 0.5s ease;
        `;
        
        document.body.appendChild(musicTooltip);
        
        // Hapus setelah 5 detik
        setTimeout(() => {
            if (musicTooltip.parentNode) {
                musicTooltip.style.opacity = '0';
                musicTooltip.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (musicTooltip.parentNode) {
                        musicTooltip.parentNode.removeChild(musicTooltip);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    // Fungsi untuk toggle musik
    function toggleMusic() {
        if (!backgroundMusic) return;
        
        isMusicPlaying = !isMusicPlaying;
        
        if (isMusicPlaying) {
            // Coba play musik
            const playPromise = backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Musik dimulai setelah klik');
                        updateMusicButton();
                    })
                    .catch(error => {
                        console.log('Gagal memutar musik:', error);
                        isMusicPlaying = false;
                        updateMusicButton();
                    });
            }
        } else {
            backgroundMusic.pause();
            updateMusicButton();
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
            setupFormName();
        }
    }
    
    // Fungsi untuk update tombol navigasi
    function updateNavButtons() {
        if (prevBtn) {
            prevBtn.style.display = currentSlide === 0 ? 'none' : 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'flex';
        }
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
            
            // Tampilkan pesan sukses
            showFormMessage('Konfirmasi kehadiran berhasil dikirim. Terima kasih!', 'success');
            
            // Reset form tapi biarkan nama tetap
            document.getElementById('attendance').value = '';
            document.getElementById('message').value = '';
            
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
        if (!formMessage) return;
        
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
        if (!loading) return;
        
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }, 1000);
    }
    
    // Inisialisasi event listeners
    function initEventListeners() {
        // Tombol navigasi
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        // Indikator slide
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Kontrol musik
        if (musicToggle) {
            musicToggle.addEventListener('click', toggleMusic);
        }
        
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
        if (attendanceForm) {
            attendanceForm.addEventListener('submit', submitForm);
        }
        
        // Event listener untuk memulai musik setelah interaksi pengguna
        document.body.addEventListener('click', function initMusicOnInteraction() {
            if (!isMusicPlaying) {
                startBackgroundMusic();
            }
        }, { once: true });
        
        // Coba mulai musik saat halaman selesai dimuat
        window.addEventListener('load', function() {
            setTimeout(startBackgroundMusic, 500);
        });
    }
    
    // Inisialisasi aplikasi
    function initApp() {
        // Sembunyikan loading
        simulateLoading();
        
        // Setup nama tamu
        setupGuestName();
        
        // Setup event listeners
        initEventListeners();
        
        // Update tombol navigasi
        updateNavButtons();
        
        // Update tombol musik
        updateMusicButton();
        
        // Coba mulai musik segera setelah inisialisasi
        setTimeout(startBackgroundMusic, 300);
    }
    
    // Jalankan inisialisasi aplikasi
    initApp();
});
