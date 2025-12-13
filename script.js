/* =========================================
   1. FIREBASE KÜTÜPHANELERİ VE AYARLAR
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const FILE_EXTENSION = ".png"; 

// Örnek Veriler (Resim yollarının doğruluğundan emin ol)
const prompts = [
    { id: 1, image: `images/autumn-fashion${FILE_EXTENSION}`, text: "Create an ultra-realistic autumn fashion...", isPremium: false, category: "boydan" },
    { id: 2, image: `images/stylish-man${FILE_EXTENSION}`, text: "Create an ultra-realistic winter fashion...", isPremium: true, category: "boydan" },
    { id: 3, image: `images/gentleman-portrait${FILE_EXTENSION}`, text: "Create an ultra-realistic, dramatic...", isPremium: true, category: "portre" },
    { id: 4, image: `images/gentleman-sitting${FILE_EXTENSION}`, text: "Create an ultra-realistic, formal...", isPremium: false, category: "portre" },
    { id: 5, image: `images/standing-man${FILE_EXTENSION}`, text: "Create an ultra-realistic fashion...", isPremium: false, category: "boydan" }
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
};
window.openRegisterModal = () => { 
    if(registerModal) registerModal.classList.remove('hidden'); 
    if(loginModal) loginModal.classList.add('hidden'); 
};
window.closeAuthModals = () => { 
    if(loginModal) loginModal.classList.add('hidden');
    if(registerModal) registerModal.classList.add('hidden');
};
window.openProfileModal = () => { 
    if(profileModal) profileModal.classList.remove('hidden'); 
    renderAvatarGrid();
};
window.closeProfileModal = () => { if(profileModal) profileModal.classList.add('hidden'); };

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
    else {
        pendingPrompt = text; 
        if(adModal) adModal.classList.remove('hidden');
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
        showToast("İşlem iptal edildi ❌");
    });
}

/* =========================================
   7. GALERİ RENDER (TEK VE DÜZGÜN FONKSİYON)
   ========================================= */
function renderGallery(dataList) {
    if (!gallery) return;

    // Filtreleme
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

    let filtered = [...dataList];

    if (activeFilter === "favorites" && userData) {
        filtered = filtered.filter(item => userData.favorites.includes(item.id));
    } else if (activeFilter !== "all" && activeFilter) {
        filtered = filtered.filter(item => item.category === activeFilter);
    }

    gallery.innerHTML = "";

    if (filtered.length === 0) {
        gallery.innerHTML = "<p style='text-align:center;color:#aaa;margin-top:50px;width:100%;'>Bu kategoride içerik yok.</p>";
        return;
    }

    filtered.forEach((item, index) => {
        // --- BUTTON MANTIĞI ---
        const badgeHTML = item.isPremium ? `<div class="premium-badge"><i class="fa-solid fa-crown"></i> PREMIUM</div>` : '';
        
        // Varsayılan (Free) Buton
        let btnText = 'Kopyala';
        let btnIcon = '<i class="fa-regular fa-copy"></i>';
        let buttonClass = 'copy-btn';
        let onClickFunc = `handleCopy('${item.text.replace(/'/g, "\\'")}', ${item.isPremium})`;

        // Premium Buton Durumları
        if (item.isPremium) {
            const userBalance = userData ? userData.credits : 0;
            
            if (userBalance >= PROMPT_COST) {
                // Parası Yetiyor
                btnText = `${PROMPT_COST} Kredi`;
                btnIcon = '<i class="fa-regular fa-gem"></i>';
            } else {
                // Parası Yetmiyor -> Reklam İzle
                btnText = 'Kredi Kazan'; // Reklam izlemeye yönlendirir
                btnIcon = '<i class="fa-solid fa-play"></i>';
                buttonClass += ' ad-unlock-btn'; // Mor stil
            }
        }

        const isFav = userData && userData.favorites.includes(item.id);
        const heartClass = isFav ? 'fa-solid' : 'fa-regular';
        const activeClass = isFav ? 'active' : '';

        // HTML Çizimi
        gallery.innerHTML += `
            <div class="card" style="animation-delay:${index * 0.05}s">
                <img src="${item.image}" class="card-img" onclick="openLightbox(${item.id})">
                ${badgeHTML}
                <button class="fav-btn ${activeClass}" onclick="toggleFavorite(${item.id})">
                    <i class="${heartClass} fa-heart"></i>
                </button>
                <div class="card-overlay">
                    <p class="prompt-text">${item.text}</p>
                    <div class="card-actions">
                        <button class="${buttonClass}" onclick="${onClickFunc}">
                            ${btnIcon} ${btnText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Filtre Butonları
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(prompts);
    });
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
    if(modalPromptText) modalPromptText.innerText = item.text;
    
    if (item.isPremium) modalBadge.classList.remove('hidden');
    else modalBadge.classList.add('hidden');

    // Lightbox içindeki Action Button Mantığı
    if(modalActionBtn) {
        modalActionBtn.className = "action-btn-large"; 
        
        if (item.isPremium) {
            const userBalance = userData ? userData.credits : 0;
            if (userBalance >= PROMPT_COST) {
                modalActionBtn.innerHTML = `<i class="fa-regular fa-gem"></i> ${PROMPT_COST} Kredi ile Al`;
                modalActionBtn.style.background = "#fff";
                modalActionBtn.style.color = "#000";
            } else {
                modalActionBtn.innerHTML = `<i class="fa-solid fa-play"></i> Reklam İzle (+${AD_REWARD})`;
                modalActionBtn.classList.add('ad-unlock-btn-large');
            }
        } else {
            modalActionBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Ücretsiz Kopyala`;
            modalActionBtn.style.background = "#fff";
            modalActionBtn.style.color = "#000";
        }
        
        modalActionBtn.onclick = () => window.handleCopy(safeText, item.isPremium);
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