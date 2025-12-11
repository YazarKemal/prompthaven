/* =========================================
   1. VERİTABANI (SİTE İÇERİĞİ)
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
   2. HTML ELEMENTLERİ
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

/* =========================================
   3. GALERİYİ ÇİZME (RENDER)
   ========================================= */
function renderGallery(dataList) {
    gallery.innerHTML = ""; 

    if (dataList.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; color:#888; margin-top:50px;'>Aradığınız kriterde prompt bulunamadı. 😔</p>";
        return;
    }
    
    dataList.forEach(item => {
        const badgeHTML = item.isPremium ? `<div class="premium-badge"><i class="fa-solid fa-crown"></i> PREMIUM</div>` : '';
        const btnIcon = item.isPremium ? '<i class="fa-solid fa-lock"></i> Kilidi Aç' : '<i class="fa-regular fa-copy"></i> Kopyala';
        const safeText = item.text.replace(/'/g, "\\'");

        const cardHTML = `
            <div class="card">
                <img src="${item.image}" alt="AI Art" class="card-img" loading="lazy" onclick="openLightbox('${item.image}')">
                ${badgeHTML}
                <div class="card-overlay">
                    <p class="prompt-text">${item.text}</p>
                    <button class="copy-btn" onclick="handleCopy('${safeText}', ${item.isPremium})">
                        ${btnIcon}
                    </button>
                </div>
            </div>
        `;
        gallery.innerHTML += cardHTML;
    });
}

/* =========================================
   4. ARAMA VE FİLTRELEME
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
        } else {
            renderGallery(prompts.filter(item => item.category === categoryValue));
        }
    });
});

/* =========================================
   5. GÜÇLENDİRİLMİŞ KOPYALAMA SİSTEMİ
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

// YENİ: Hem modern hem eski tarayıcılar (ve yerel dosyalar) için kopyalama
function copyToClipboard(text) {
    // Yöntem 1: Modern API (HTTPS gerektirir)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Kopyalandı! ✅");
        }).catch(err => {
            console.error('Modern kopya hatası:', err);
            // Hata verirse Yöntem 2'yi dene
            fallbackCopy(text);
        });
    } else {
        // Yöntem 2: Güvenli olmayan ortamlar (Yerel dosya) için
        fallbackCopy(text);
    }
}

// Yöntem 2: B Planı (Görünmez kutu oluşturup kopyalar)
function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Görünmemesi için
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast("Kopyalandı! ✅");
        } else {
            showToast("Kopyalama başarısız ❌");
        }
    } catch (err) {
        console.error('B Planı hatası:', err);
        showToast("Hata oluştu.");
    }
    document.body.removeChild(textArea);
}

/* =========================================
   6. REKLAM ZAMANLAYICISI (3 SANİYE)
   ========================================= */
watchBtn.addEventListener('click', () => {
    watchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...';
    watchBtn.style.pointerEvents = "none";

    setTimeout(() => {
        modal.classList.add('hidden');
        copyToClipboard(currentPremiumPrompt); // Burası da artık B Planını kullanabilir
        
        watchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reklamı İzle (Demo)';
        watchBtn.style.pointerEvents = "auto";
    }, 3000); 
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

/* =========================================
   7. LIGHTBOX
   ========================================= */
function openLightbox(imageUrl) {
    lightboxImg.src = imageUrl;
    imageModal.classList.remove('hidden');
}

function closeLightbox(event) {
    if (event.target !== lightboxImg) {
        imageModal.classList.add('hidden');
    }
}

// Başlangıç
renderGallery(prompts);