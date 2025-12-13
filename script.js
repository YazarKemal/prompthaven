/* =========================================
   1. FIREBASE KÜTÜPHANELERİ VE AYARLAR
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SCROLL KİLİDİ YÖNETİCİSİ
function toggleBodyScroll(lock) {
    if (lock) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
}

// Senin Proje Ayarların
const firebaseConfig = {
  apiKey: "AIzaSyD1xhua_m0QjJY7jMQAzc2SJyKHr_N8MX4", // Burası senin gerçek key'in olmalı
  authDomain: "prompthaven-646fe.firebaseapp.com",
  projectId: "prompthaven-646fe",
  storageBucket: "prompthaven-646fe.firebasestorage.app",
  messagingSenderId: "798970486770",
  appId: "1:798970486770:web:f518bb62042571f3f3956b"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* =========================================
   2. VERİTABANI (PROMPTLAR)
   ========================================= */
/* =========================================
   2. VERİTABANI (PROMPTLAR)
   ========================================= */

const prompts = [
    // --- ESKİLER (1-5) (Zaten PNG idi) ---
    { id: 1, image: `images/autumn-fashion.png`, text: "Create an ultra-realistic autumn fashion...", isPremium: false, category: "boydan" },
    { id: 2, image: `images/stylish-man.png`, text: "Create an ultra-realistic winter fashion...", isPremium: true, category: "boydan" },
    { id: 3, image: `images/gentleman-portrait.png`, text: "Create an ultra-realistic, dramatic...", isPremium: true, category: "portre" },
    { id: 4, image: `images/gentleman-sitting.png`, text: "Create an ultra-realistic, formal...", isPremium: false, category: "portre" },
    { id: 5, image: `images/standing-man.png`, text: "Create an ultra-realistic fashion...", isPremium: false, category: "boydan" },

    // --- YENİ EKLENENLER (6-15) (PNG OLARAK DÜZELTİLDİ) ---
    
    // 6. Karizma Men (Portre - Premium)
    { 
        id: 6, 
        image: `images/karizma-men.png`, 
        text: `European intellectual interior portrait, minimalist modern classic aesthetic with academic calm, a man seated casually on a low sofa against a raw concrete wall, asymmetrical composition with large negative space on one side, relaxed but focused posture, legs crossed, body slightly leaning back, one hand holding a pen and writing in a notebook resting on the lap.`, 
        isPremium: true, 
        category: "portre" 
    },

    // 7. John Wick Tarzı (Aksiyon - Premium)
    { 
        id: 7, 
        image: `images/john-wick.png`, 
        text: `Modern neo-noir urban action portrait, grounded realism with restrained intensity, a man frozen mid-moment in a tense street confrontation, low athletic stance, knees bent, weight forward, tailored dark suit worn and weathered, subtle damage and dirt visible, minimal, functional gear integrated discreetly into the outfit.`, 
        isPremium: true, 
        category: "boydan" 
    },

    // 8. Komutan Bey (Yağlı Boya - Premium)
    { 
        id: 8, 
        image: `images/komutar-bey.png`, 
        text: `Classical oil painting portrait, late 18th to early 19th century European military aesthetic, romantic realism with baroque lighting influence, dramatic chiaroscuro, face emerging from deep shadow, intense frontal portrait composition, solemn, determined expression, subtle emotional gravity.`, 
        isPremium: true, 
        category: "portre" 
    },

    // 9. Black Men (Moda - Ücretsiz)
    { 
        id: 9, 
        image: `images/black-men.png`, 
        text: `Modern European intellectual fashion portrait, minimalist masculine elegance with classical proportions, a man standing in front of monumental stone columns and urban architecture, cool neutral daylight, overcast atmosphere, long tailored dark navy or charcoal overcoat.`, 
        isPremium: false, 
        category: "boydan" 
    },

    // 10. Tactical Men (Askeri - Premium)
    { 
        id: 10, 
        image: `images/tactical-men.png`, 
        text: `Modern cinematic action realism with grounded physical intensity, contemporary conflict zone street scene, a man caught mid-motion in a defensive combat stance, wide grounded posture, knees bent, center of gravity low, one arm extended forward in a protective gesture, the other arm pulled back holding a short combat knife.`, 
        isPremium: true, 
        category: "boydan" 
    },

    // 11. Clark Kent Tarzı (Sokak - Ücretsiz)
    { 
        id: 11, 
        image: `images/clark-kent.png`, 
        text: `European intellectual street portrait, timeless vintage-modern aesthetic, a man sitting casually on a simple public bench in an urban street, relaxed posture, one leg extended forward, hands resting naturally, long brown wool overcoat worn open, soft and slightly oversized.`, 
        isPremium: false, 
        category: "boydan" 
    },

    // 12. Thinking Men (Düşünen Adam - Ücretsiz)
    { 
        id: 12, 
        image: `images/thinking-men.png`, 
        text: `European intellectual interior portrait, intimate writer’s solitude with classical restraint, a man seated alone in an antique upholstered armchair, body slightly turned to the side, relaxed yet inward posture, one elbow resting on the armrest, hand supporting the face in a thinking gesture.`, 
        isPremium: false, 
        category: "portre" 
    },

    // 13. Shooter Men (Silahlı - Premium)
    { 
        id: 13, 
        image: `images/shooter-men.png`, 
        text: `Classic neo-noir close-up portrait, restrained masculine authority with minimal emotion, tight frontal composition focused on the subject’s face and hands, a man holding a handgun directly toward the camera plane, arms steady, wrists aligned, posture rigid and controlled.`, 
        isPremium: true, 
        category: "portre" 
    },

    // 14. Europan Men (Klasik - Ücretsiz)
    { 
        id: 14, 
        image: `images/europan-men.png`, 
        text: `Refined European menswear portrait photography, timeless classic style with modern minimal elegance, a man standing outdoors in front of historic stone architecture, neutral urban courtyard setting, subtle winter atmosphere, fitted ribbed knit long-sleeve polo sweater in deep brown tones.`, 
        isPremium: false, 
        category: "boydan" 
    },

    // 15. Gray Men (Gri Tonlar - Ücretsiz)
    { 
        id: 15, 
        image: `images/gray-men.png`, 
        text: `Modern European intellectual fashion portrait, minimalist masculine elegance with classical proportions, a man standing in front of monumental stone columns and urban architecture, cool neutral daylight, overcast atmosphere, long tailored dark navy or charcoal overcoat, fitted black or dark grey turtleneck sweater.`, 
        isPremium: false, 
        category: "boydan" 
    }
];

// Element Seçicileri
const gallery = document.getElementById('gallery');
const toast = document.getElementById('toast');
const adModal = document.getElementById('ad-modal'); 
const authActions = document.getElementById('auth-actions');
const userProfile = document.getElementById('user-profile');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const creditCountSpan = document.getElementById('credit-count'); // Eğer HTML'de yoksa hata vermemesi için kontrol edeceğiz
const headerCreditSpan = document.getElementById('header-credit'); 
const creditBadge = document.getElementById('credit-display'); // Header'daki kredi kutusu
const headerAvatar = document.getElementById('header-avatar');
const previewAvatar = document.getElementById('preview-avatar');
const profileModal = document.getElementById('profile-modal');
const avatarGrid = document.getElementById('avatar-grid');
const lightboxImg = document.getElementById('lightbox-img');
const imageModal = document.getElementById('image-modal');

// Reklam Elementleri
const claimBtn = document.getElementById('claim-reward-btn');
const timerDisplay = document.getElementById('timer-display');
const closeAdBtn = document.getElementById('close-ad-modal');

// GLOBAL DEĞİŞKENLER
let currentUser = null; 
let userData = null;    
let countdownInterval; 

// EKONOMİ AYARLARI 💰
const STARTING_CREDITS = 1000;
const PROMPT_COST = 100; // Premium Prompt Maliyeti
const AD_REWARD = 50;    // 1 Reklam İzleme Ödülü (2 Reklam = 100 Kredi)
const SHARE_REWARD = 100;
const AVATARS = ["😎", "🕵️‍♂️", "👩‍🎨", "👨‍💻", "🦁", "🦊", "🐼", "🤖", "👽", "🦄", "⚡", "🔥", "💎", "🎨", "🚀"];

/* =========================================
   3. FIREBASE AUTH VE KULLANICI YÖNETİMİ
   ========================================= */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if(authActions) authActions.classList.add('hidden');
        if(userProfile) userProfile.classList.remove('hidden');
        await loadUserData(user);
        showToast(`Hoşgeldin ${user.displayName || 'Gezgin'}! 👋`);
    } else {
        currentUser = null;
        userData = null;
        if(authActions) authActions.classList.remove('hidden');
        if(userProfile) userProfile.classList.add('hidden');
        if(headerAvatar) headerAvatar.innerText = "😎";
        renderGallery(prompts); // Giriş yapmamış haliyle render et
    }
});

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        userData = docSnap.data();
    } else {
        // Yeni kullanıcı oluştur
        userData = {
            credits: STARTING_CREDITS,
            avatar: "😎",
            favorites: [],
            email: user.email,
            name: user.displayName
        };
        await setDoc(userRef, userData);
    }
    updateUI();
}

function updateUI() {
    if (!userData) return;
    if(headerCreditSpan) headerCreditSpan.innerText = userData.credits;
    if(headerAvatar) headerAvatar.innerText = userData.avatar;
    if(previewAvatar) previewAvatar.innerText = userData.avatar;
    
    // UI güncellenince galeriyi tekrar çiz (Kilitleri açmak/kapamak için)
    renderGallery(prompts);
}

/* =========================================
   4. MODAL YÖNETİMİ
   ========================================= */
window.openLoginModal = () => { 
    if(loginModal) loginModal.classList.remove('hidden'); 
    if(registerModal) registerModal.classList.add('hidden'); 
    toggleBodyScroll(true); // <--- KİLİTLE
};

window.openRegisterModal = () => { 
    if(registerModal) registerModal.classList.remove('hidden'); 
    if(loginModal) loginModal.classList.add('hidden'); 
    toggleBodyScroll(true); // <--- KİLİTLE
};

window.closeAuthModals = () => { 
    if(loginModal) loginModal.classList.add('hidden');
    if(registerModal) registerModal.classList.add('hidden');
    toggleBodyScroll(false); // <--- KİLİDİ AÇ
};

window.openProfileModal = () => { 
    if(profileModal) profileModal.classList.remove('hidden'); 
    renderAvatarGrid();
    toggleBodyScroll(true); // <--- KİLİTLE
};

window.closeProfileModal = () => { 
    if(profileModal) profileModal.classList.add('hidden'); 
    toggleBodyScroll(false); // <--- KİLİDİ AÇ
};
/* =========================================
   5. İŞLEMLER (GİRİŞ, ÇIKIŞ, AVATAR)
   ========================================= */
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
        closeAuthModals();
    } catch (error) { console.error(error); showToast("Giriş başarısız oldu ❌"); }
};

window.simulateLogin = () => {
    showToast("Demo modunda Google girişini kullanın 👇");
}

window.logoutUser = async () => {
    try {
        await signOut(auth);
        if(profileModal) profileModal.classList.add('hidden');
        window.location.reload(); // Sayfayı yenile ki her şey sıfırlansın
    } catch (error) { console.error(error); }
};

window.saveProfileChanges = async () => {
    if (!currentUser) return;
    const selected = document.querySelector('.avatar-option.selected');
    if (selected) {
        const newAvatar = selected.innerText;
        const userRef = doc(db, "users", currentUser.uid);
        userData.avatar = newAvatar;
        updateUI();
        await updateDoc(userRef, { avatar: newAvatar });
        window.closeProfileModal();
        showToast("Profil Güncellendi! ✨");
    }
};

/* =========================================
   6. KOPYALAMA VE REKLAM MANTIĞI (DÜZELTİLDİ) 🛠️
   ========================================= */
let pendingPrompt = ""; 

window.handleCopy = async (text, isPremium) => {
    // 1. Durum: Ücretsiz İçerik (Herkes alabilir)
    if (!isPremium) {
        copyToClipboard(text);
        return;
    }

    // 2. Durum: Premium İçerik ama Giriş Yapılmamış
    if (isPremium && !currentUser) {
        showToast("Premium içerik için giriş yapmalısınız! 🔒");
        setTimeout(() => { window.openLoginModal(); }, 1000);
        return;
    }

    // 3. Durum: Premium İçerik + Giriş Yapılmış + Yeterli Kredi
    if (isPremium && userData.credits >= PROMPT_COST) {
        const newCredits = userData.credits - PROMPT_COST;
        const userRef = doc(db, "users", currentUser.uid);
        
        userData.credits = newCredits;
        updateUI(); // UI anında güncellensin
        animateCredit('loss');
        
        await updateDoc(userRef, { credits: newCredits });
        copyToClipboard(text);
        showToast(`-${PROMPT_COST} Kredi düştü. Kalan: ${newCredits}`);
    } 
    // 4. Durum: Yetersiz Kredi -> Reklam İzlet
    // handleCopy fonksiyonunun içinde, en alttaki else (kredi yetersiz) bloğu:
    else {
        pendingPrompt = text; 
        if(adModal) adModal.classList.remove('hidden');
        toggleBodyScroll(true); // <--- KİLİTLE (Reklam açılınca)
        startAdTimer();
    }
};

/* --- REKLAM SİSTEMİ (SAYAÇLI) --- */
function startAdTimer() {
    let timeLeft = 10; // 10 Saniye bekleme
    if(timerDisplay) timerDisplay.innerText = timeLeft;
    
    // Butonu Pasif Yap
    if(claimBtn) {
        claimBtn.style.opacity = "0.5";
        claimBtn.style.pointerEvents = "none";
        claimBtn.style.background = "#374151";
        claimBtn.style.color = "#9ca3af";
        claimBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Bekleyiniz...';
    }

    // Varsa eski sayacı temizle
    clearInterval(countdownInterval); 
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            if(timerDisplay) timerDisplay.innerText = "🎉";
            
            // Butonu Aktif Yap
            if(claimBtn) {
                claimBtn.style.opacity = "1";
                claimBtn.style.pointerEvents = "auto";
                claimBtn.style.background = "#4ade80"; // Yeşil
                claimBtn.style.color = "#000"; 
                claimBtn.innerHTML = `<i class="fa-solid fa-check"></i> Ödülü Al (+${AD_REWARD} Kredi)`;
            }
        }
    }, 1000);
}

// Ödülü Al Butonuna Tıklayınca
if (claimBtn) {
    claimBtn.addEventListener('click', async () => {
        if(!currentUser) return; // Güvenlik

        claimBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...';
        
        const newCredits = userData.credits + AD_REWARD;
        const userRef = doc(db, "users", currentUser.uid);
        
        userData.credits = newCredits;
        updateUI();
        animateCredit('gain');
        
        await updateDoc(userRef, { credits: newCredits });
        
        if(adModal) adModal.classList.add('hidden'); 
        toggleBodyScroll(false);
        showToast(`Tebrikler! +${AD_REWARD} Kredi Kazandın 💎`);
        
        // Eğer kredi artık yetiyorsa kullanıcıya haber ver
        if (newCredits >= PROMPT_COST) {
             setTimeout(() => showToast("Artık Premium Promptu alabilirsin! 🚀"), 1500);
        } else {
             setTimeout(() => showToast("Bir reklam daha izlemelisin! 📺"), 1500);
        }
    });
}

// Reklamı Kapatma
if (closeAdBtn) {
    closeAdBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        if(adModal) adModal.classList.add('hidden');
        toggleBodyScroll(false);
        showToast("İşlem iptal edildi ❌");
    });
}

/* =========================================
   7. GALERİ RENDER (TEK VE DÜZGÜN FONKSİYON)
   ========================================= */
/* =========================================
   SONSUZ SCROLL İÇİN YENİ DEĞİŞKENLER
   (Bunları script.js'in en üstüne, diğer değişkenlerin yanına ekle)
   ========================================= */
let activePrompts = []; // Şu an filtrelenmiş, gösterilmeyi bekleyen tüm liste
let loadedCount = 0;    // Ekrana basılmış sayı
const BATCH_SIZE = 8;   // İlk açılışta kaç tane gelsin?
const LOAD_MORE_COUNT = 4; // Aşağı indikçe kaçar kaçar gelsin?
let isLoading = false;  // Şu an yükleme yapıyor mu?

/* =========================================
   7. YENİ AKILLI GALERİ SİSTEMİ (RENDER)
   (Eski renderGallery fonksiyonunu sil, bunu yapıştır)
   ========================================= */
function renderGallery(dataList, isScroll = false) {
    if (!gallery) return;

    // A) EĞER BU BİR SCROLL YÜKLEMESİ DEĞİLSE (Yani filtre değiştiyse veya sayfa yeni açıldıysa)
    if (!isScroll) {
        gallery.innerHTML = ""; // Ekranı temizle
        loadedCount = 0;        // Sayacı sıfırla
        
        // 1. Filtreleme Mantığı
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        activePrompts = [...dataList]; // Ana listeyi kopyala

        if (activeFilter === "favorites" && userData) {
            activePrompts = activePrompts.filter(item => userData.favorites.includes(item.id));
        } else if (activeFilter !== "all" && activeFilter) {
            activePrompts = activePrompts.filter(item => item.category === activeFilter);
        }

        // Eğer hiç sonuç yoksa
        if (activePrompts.length === 0) {
            gallery.innerHTML = "<p style='text-align:center;color:#aaa;margin-top:50px;width:100%;grid-column:1/-1;'>Bu kategoride içerik yok.</p>";
            return;
        }

        // Yükleniyor spinner'ını ekle (En alta)
        const spinnerDiv = document.createElement('div');
        spinnerDiv.id = 'loading-indicator';
        spinnerDiv.className = 'loading-spinner';
        spinnerDiv.innerHTML = '<div class="spinner-icon"></div>';
        gallery.appendChild(spinnerDiv);
    }

    // B) LİSTEDEN YENİ PARÇAYI AL VE BAS
    // İlk açılışsa BATCH_SIZE kadar, scroll ise LOAD_MORE_COUNT kadar al
    const limit = isScroll ? LOAD_MORE_COUNT : BATCH_SIZE;
    
    // Hangi aralığı keseceğiz?
    const nextBatch = activePrompts.slice(loadedCount, loadedCount + limit);

    // Yükleniyor simgesini bul (en sona eklemiştik)
    const spinner = document.getElementById('loading-indicator');

    nextBatch.forEach((item, index) => {
        // Kart HTML'ini oluştur
        const badgeHTML = item.isPremium ? `<div class="premium-badge"><i class="fa-solid fa-crown"></i> PREMIUM</div>` : '';
        let btnText = 'Kopyala';
        let btnIcon = '<i class="fa-regular fa-copy"></i>';
        let buttonClass = 'copy-btn';
        
        // --- YENİ EKLENEN KISIM: METİN GİZLEME MANTIĞI ---
        let visibleText = item.text; // Varsayılan: Gerçek metni göster
        
        if (item.isPremium) {
            // Eğer Premium ise metni değiştir
            visibleText = `
                <div class="lock-message"><i class="fa-solid fa-lock"></i> Gizli Prompt</div>
                <div class="premium-blur">Bu prompt gizlenmiştir. Görmek için kilidi açın. Lorem ipsum dolor sit amet...</div>
            `;
        }
        // ------------------------------------------------

        let onClickFunc = `handleCopy('${item.text.replace(/'/g, "\\'")}', ${item.isPremium})`;

        if (item.isPremium) {
            const userBalance = userData ? userData.credits : 0;
            if (userBalance >= PROMPT_COST) {
                btnText = `${PROMPT_COST} Kredi`;
                btnIcon = '<i class="fa-regular fa-gem"></i>';
            } else {
                btnText = 'Kredi Kazan';
                btnIcon = '<i class="fa-solid fa-play"></i>';
                buttonClass += ' ad-unlock-btn';
            }
        }

        const isFav = userData && userData.favorites.includes(item.id);
        const heartClass = isFav ? 'fa-solid' : 'fa-regular';
        const activeClass = isFav ? 'active' : '';

        // Elemanı Yarat
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.animationDelay = `${index * 0.05}s`; 
        cardDiv.innerHTML = `
            <img src="${item.image}" class="card-img" onclick="openLightbox(${item.id})">
            ${badgeHTML}
            <button class="fav-btn ${activeClass}" onclick="toggleFavorite(${item.id})">
                <i class="${heartClass} fa-heart"></i>
            </button>
            <div class="card-overlay">
                <div class="prompt-text">${visibleText}</div> 
                <div class="card-actions">
                    <button class="${buttonClass}" onclick="${onClickFunc}">
                        ${btnIcon} ${btnText}
                    </button>
                </div>
            </div>
        `;
        
        // ... (Kalan kodlar aynı) ...
        // Spinner'dan hemen öncesine ekle (Spinner hep en altta kalsın)
        if (spinner) {
            gallery.insertBefore(cardDiv, spinner);
        } else {
            gallery.appendChild(cardDiv);
        }
    });

    // Sayacı güncelle
    loadedCount += nextBatch.length;
    isLoading = false; // Kilidi aç

    // Hepsi bittiyse Spinner'ı gizle
    if (loadedCount >= activePrompts.length && spinner) {
        spinner.style.display = 'none';
    } else if (spinner) {
        spinner.style.display = 'block'; // Daha içerik varsa göster
    }
}

// --- SCROLL DİNLEYİCİSİ (Aşağı inince tetiklenir) ---
window.addEventListener('scroll', () => {
    // Sayfanın en altına 100px kala tetikle
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        // Eğer zaten yüklemiyorsa ve daha gösterilecek içerik varsa
        if (!isLoading && loadedCount < activePrompts.length) {
            isLoading = true;
            // Küçük bir yapay gecikme ekleyelim ki "Yükleniyor" animasyonu görünsün (Daha havalı durur)
            setTimeout(() => {
                renderGallery(activePrompts, true); // true = scroll modunda çağır
            }, 500); 
        }
    }
});
/* =========================================
   8. LIGHTBOX & DİĞER YARDIMCILAR
   ========================================= */
window.openLightbox = (id) => { 
    if(!imageModal || !lightboxImg) return;
    
    const item = prompts.find(p => p.id === id);
    if(!item) return;

    // Modal İçeriği
    const modalPromptText = document.getElementById('modal-prompt-text');
    const modalActionBtn = document.getElementById('modal-action-btn');
    const modalBadge = document.getElementById('modal-premium-badge');
    const safeText = item.text.replace(/'/g, "\\'");

    lightboxImg.src = item.image;
   // --- BURASI DEĞİŞTİ ---
    if(modalPromptText) {
        if (item.isPremium) {
            // Premium ise Gizli Mesaj Göster
            modalPromptText.innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <i class="fa-solid fa-lock" style="font-size: 2rem; color: #ffd700; margin-bottom: 10px;"></i><br>
                    <span style="color: #fff; font-weight: bold;">Bu Prompt Premium'dur</span><br>
                    <span style="color: #9ca3af; font-size: 0.9rem;">İçeriği kopyalamak için kredinizi kullanın.</span>
                    <div class="premium-blur" style="margin-top:15px;">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </div>
                </div>
            `;
        } else {
            // Ücretsiz ise Gerçek Metni Göster
            modalPromptText.innerText = item.text;
        }
    }
    // Favori Butonu
    const modalFavBtn = document.getElementById('modal-fav-btn');
    if(modalFavBtn) {
        modalFavBtn.className = "fav-btn-large";
        modalFavBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        
        if (userData && userData.favorites.includes(item.id)) {
            modalFavBtn.classList.add('active');
            modalFavBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        }
        modalFavBtn.onclick = async () => {
            await window.toggleFavorite(item.id);
            window.openLightbox(item.id); // Yenile
        };
    }
    
    imageModal.classList.remove('hidden');
    toggleBodyScroll(true);

    // "Buna Benzer Stiller" Bölümü (Alttaki Grid)
    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) {
        relatedGrid.innerHTML = "";
        let relatedItems = prompts.filter(p => p.category === item.category && p.id !== id).slice(0, 4);
        
        relatedItems.forEach(relItem => { 
            const isPrem = relItem.isPremium ? '<span class="related-badge">👑</span>' : '';
            const div = document.createElement('div');
            div.className = 'related-card';
            div.innerHTML = `<img src="${relItem.image}" class="related-img">${isPrem}`;
            div.onclick = () => window.openLightbox(relItem.id);
            relatedGrid.appendChild(div);
        });
    }
};

window.closeLightbox = (e) => { 
    if (e.target.id === 'image-modal' || e.target.classList.contains('close-image-btn')) {
        imageModal.classList.add('hidden'); 
        toggleBodyScroll(false);
    }
};

function getSimilarPrompts(currentId, category) {
    let filtered = prompts.filter(p => p.category === category && p.id !== currentId);
    return filtered.sort(() => Math.random() - 0.5).slice(0, 4);
}

// Diğer Yardımcı Fonksiyonlar
window.toggleFavorite = async (id) => {
    if (!currentUser) { showToast("Favorilemek için giriş yapın ❤️"); return; }
    const userRef = doc(db, "users", currentUser.uid);
    if (userData.favorites.includes(id)) {
        userData.favorites = userData.favorites.filter(fav => fav !== id);
        await updateDoc(userRef, { favorites: arrayRemove(id) });
        showToast("Favorilerden çıkarıldı 💔");
    } else {
        userData.favorites.push(id);
        await updateDoc(userRef, { favorites: arrayUnion(id) });
        showToast("Favorilere eklendi ❤️");
    }
    updateUI(); 
};

window.handleShare = async (text) => {
    const shareData = { title: 'PromptHaven', text: text + "\n\n🚀 PromptHaven!", url: window.location.href };
    try { 
        if (navigator.share) await navigator.share(shareData);
        else window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`, '_blank'); 
        
        if (currentUser) {
            // Paylaşım ödülü (İsteğe bağlı, spam olmasın diye timeout koyabilirsin)
            const newCredits = userData.credits + SHARE_REWARD;
            const userRef = doc(db, "users", currentUser.uid);
            userData.credits = newCredits;
            updateUI();
            animateCredit('gain');
            await updateDoc(userRef, { credits: newCredits });
            showToast(`Paylaşım Ödülü: +${SHARE_REWARD} Kredi! 🎉`);
        }
    } catch (err) {} 
};

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast("Kopyalandı! ✅"));
    } else {
        const textArea = document.createElement("textarea"); 
        textArea.value = text;
        document.body.appendChild(textArea); 
        textArea.select();
        document.execCommand('copy'); 
        document.body.removeChild(textArea);
        showToast("Kopyalandı! ✅");
    }
}

function showToast(message) {
    if(toast) { 
        toast.innerText = message; 
        toast.classList.add('show'); 
        setTimeout(() => { toast.classList.remove('show'); }, 3000); 
    }
}

function animateCredit(type) {
    if (headerCreditSpan) {
        headerCreditSpan.style.color = type === 'gain' ? '#4ade80' : '#ef4444';
        setTimeout(() => headerCreditSpan.style.color = '', 500);
    }
}

function renderAvatarGrid() {
    if(!avatarGrid) return;
    avatarGrid.innerHTML = "";
    AVATARS.forEach(emoji => {
        const div = document.createElement('div');
        div.className = `avatar-option ${emoji === (userData?.avatar || "😎") ? 'selected' : ''}`;
        div.innerText = emoji;
        div.onclick = () => {
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            if(previewAvatar) previewAvatar.innerText = emoji;
        };
        avatarGrid.appendChild(div);
    });
}