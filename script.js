/* =========================================
   1. VERİTABANI (MEVCUT VERİLERİN)
   ========================================= */
const prompts = [
    {
        id: 1,
        image: "images/autumn-fashion.png", 
        text: "Create an ultra-realistic autumn fashion editorial portrait of a [MODEL: Mature Gentleman] walking outdoors on a [LOCATION: University Campus]. He is dressed in a [OUTFIT: Rich Brown Wool Blazer layered over a Cream-Colored Turtleneck Sweater] and Tan Corduroy Trousers. The background shows stone steps and fallen orange leaves. Style: cinematic, cozy autumn atmosphere, shallow depth of field, 4K detail.",
        isPremium: false, 
        category: "boydan"
    },
    {
        id: 2,
        image: "images/stylish-man.png",
        text: "Create an ultra-realistic winter fashion editorial portrait of a [MODEL: Stylish Man] walking outdoors in [LIGHTING: Soft Morning Sunlight]. He wears a [OUTFIT: Long Tailored Camel-Colored Overcoat layered over a Thick Cable-Knit Turtleneck] and High-Waisted Wool Trousers. Background shows an urban square with bare winter trees. Style: luxury menswear, neutral monochrome palette, cinematic winter atmosphere, 4K ultra-detailed fabric textures.",
        isPremium: true, 
        category: "boydan"
    },
    {
        id: 3,
        image: "images/gentleman-portrait.png", 
        text: "Create an ultra-realistic, dramatic close-up portrait of a [MODEL: Sharply Dressed 1920s Gentleman] in a [LOCATION: Dimly Lit Room]. A [PROP: Lit Cigarette] rests between his lips, producing swirling smoke. He wears a [OUTFIT: Dark Tailored Wool Suit and Vintage Tie]. Warm, cinematic rim-lighting highlights one side of his face. Style: gritty noir-inspired aesthetic, ultra-detailed skin texture, shot on vintage cinema lens.",
        isPremium: true, 
        category: "portre"
    },
    {
        id: 4,
        image: "images/gentleman-sitting.png", 
        text: "Create an ultra-realistic, formal seated portrait of a [MODEL: 1920s Gentleman] sitting confidently in a [FURNITURE: Large Vintage Leather Armchair]. He wears a [OUTFIT: Perfectly Tailored Dark Three-Piece Suit] with a gold pocket watch chain. Expression is calm and authoritative. Lighting is soft and cinematic. Style: high-budget period drama portrait, 4K, museum-quality character portrait.",
        isPremium: false, 
        category: "portre"
    },
    {
        id: 5,
        image: "images/standing-man.png",
        text: "Create an ultra-realistic fashion editorial portrait of a [MODEL: Young Man] standing outdoors on [LOCATION: Stone Steps in front of Classical Architecture]. He wears a [OUTFIT: Loose Textured Beige V-Neck Sweater layered over an Off-White Button-Down Shirt] and Wide-Leg Brown Trousers. He carries a brown backpack. Style: luxury streetwear meets modern European editorial, warm and earthy color palette, soft cinematic lighting.",
        isPremium: false, 
        category: "boydan"
    }
];

/* =========================================
   2. HTML ELEMENTLERİ VE DEĞİŞKENLER
   ========================================= */
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const toast = document.getElementById('toast');
const modal = document.getElementById('ad-modal');
const watchBtn = document.getElementById('watch-ad-btn');
const closeBtn = document.getElementById('close-modal');
const imageModal = document.getElementById('image-modal');
const lightboxImg = document.getElementById('lightbox-img');
let currentPremiumPrompt = ""; 

// Favorileri Yükle
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

/* =========================================
   3. GALERİYİ ÇİZME (PAYLAŞ BUTONU EKLENDİ)
   ========================================= */
function renderGallery(dataList) {
    gallery.innerHTML = ""; 

    if (dataList.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; color:#888; margin-top:50px;'>Bu kriterde prompt bulunamadı. 😔</p>";
        return;
    }
    
    dataList.forEach((item, index) => {
        const badgeHTML = item.isPremium ? `<div class="premium-badge"><i class="fa-solid fa-crown"></i> PREMIUM</div>` : '';
        const btnIcon = item.isPremium ? '<i class="fa-solid fa-lock"></i> Kilidi Aç' : '<i class="fa-regular fa-copy"></i> Kopyala';
        const safeText = item.text.replace(/'/g, "\\'");

        // Favori Durumu
        const isFav = favorites.includes(item.id);
        const heartClass = isFav ? 'fa-solid' : 'fa-regular'; 
        const activeClass = isFav ? 'active' : '';

        const cardHTML = `
            <div class="card" style="animation-delay: ${index * 0.1}s">
                <img src="${item.image}" alt="AI Art" class="card-img" loading="lazy" onclick="openLightbox('${item.image}')">
                ${badgeHTML}
                
                <button class="fav-btn ${activeClass}" onclick="toggleFavorite(${item.id})">
                    <i class="${heartClass} fa-heart"></i>
                </button>

                <div class="card-overlay">
                    <p class="prompt-text">${item.text}</p>
                    
                    <div class="card-actions">
                        <button class="copy-btn" onclick="handleCopy('${safeText}', ${item.isPremium})" style="flex-grow:1; justify-content:center;">
                            ${btnIcon}
                        </button>
                        
                        <button class="share-btn" onclick="handleShare('${safeText}')" title="Paylaş">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                    </div>

                </div>
            </div>
        `;
        gallery.innerHTML += cardHTML;
    });
}

/* =========================================
   4. PAYLAŞIM ÖZELLİĞİ (YENİ)
   ========================================= */
async function handleShare(text) {
    // Paylaşılacak veri
    const shareData = {
        title: 'PromptHaven',
        text: text + "\n\n🚀 Bu harika promptu PromptHaven'da buldum!",
        url: window.location.href // Sitenin o anki linki
    };

    // 1. Yöntem: Native Share (Mobil Öncelikli)
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast("Paylaşım menüsü açıldı 📲");
        } catch (err) {
            console.log('Paylaşım iptal edildi veya hata oluştu.');
        }
    } else {
        // 2. Yöntem: Bilgisayardaysa WhatsApp Web'e gönder (Fallback)
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
        showToast("WhatsApp açılıyor... 💬");
    }
}

/* =========================================
   5. FAVORİ İŞLEMLERİ
   ========================================= */
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        showToast("Favorilerden çıkarıldı 💔");
    } else {
        favorites.push(id);
        showToast("Favorilere eklendi ❤️");
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    if (activeFilter === 'favorites') {
        const favPrompts = prompts.filter(item => favorites.includes(item.id));
        renderGallery(favPrompts);
    } else {
        // Favori olmayan ekrandaysak da kalp ikonunu güncellemek için
        const categoryValue = activeFilter;
        if (categoryValue === 'all') renderGallery(prompts);
        else renderGallery(prompts.filter(item => item.category === categoryValue));
    }
}

/* =========================================
   6. ARAMA VE FİLTRELER
   ========================================= */
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPrompts = prompts.filter(item => item.text.toLowerCase().includes(searchTerm));
    renderGallery(filteredPrompts);
});

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const categoryValue = btn.getAttribute('data-filter');
        
        if (categoryValue === 'all') {
            renderGallery(prompts);
        } else if (categoryValue === 'favorites') {
            const favPrompts = prompts.filter(item => favorites.includes(item.id));
            renderGallery(favPrompts);
        } else {
            renderGallery(prompts.filter(item => item.category === categoryValue));
        }
    });
});

/* =========================================
   7. KOPYALAMA
   ========================================= */
function showToast(message) {
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

window.handleCopy = (text, isPremium) => {
    if (isPremium) {
        currentPremiumPrompt = text;
        modal.classList.remove('hidden');
    } else {
        copyToClipboard(text);
    }
};

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Kopyalandı! ✅");
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        showToast(successful ? "Kopyalandı! ✅" : "Hata oluştu ❌");
    } catch (err) {
        showToast("Hata oluştu.");
    }
    document.body.removeChild(textArea);
}

/* =========================================
   8. REKLAM VE LIGHTBOX
   ========================================= */
watchBtn.addEventListener('click', () => {
    watchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...';
    watchBtn.style.pointerEvents = "none";
    setTimeout(() => {
        modal.classList.add('hidden');
        copyToClipboard(currentPremiumPrompt);
        watchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reklamı İzle (Demo)';
        watchBtn.style.pointerEvents = "auto";
    }, 3000); 
});

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

function openLightbox(imageUrl) {
    lightboxImg.src = imageUrl;
    imageModal.classList.remove('hidden');
}

function closeLightbox(event) {
    if (event.target !== lightboxImg) imageModal.classList.add('hidden');
}

// Başlangıç
renderGallery(prompts);