/* =========================================
   PROMPT LİSTESİ VE HTML ELEMENTLERİ
   ========================================= */
const prompts = [
    {
        id: 1,
        image: "https://image.lexica.art/full_jpg/09a06148-5226-4447-9f6f-d90060932a32",
        text: "Cyberpunk style cat sitting on a neon roof, futuristic city background, cinematic lighting, 8k resolution.",
        isPremium: false,
        category: "cyberpunk"
    },
    {
        id: 2,
        image: "https://image.lexica.art/full_jpg/2b769642-8926-4643-9831-27909cd3501a",
        text: "A portrait of a warrior princess with golden armor, intricate details, fantasy style, oil painting texture.",
        isPremium: true,
        category: "portre"
    },
    {
        id: 3,
        image: "https://image.lexica.art/full_jpg/3e8d281f-4734-4581-a64e-0b0475308693",
        text: "Cute isometric 3d render of a coffee shop, pastel colors, soft lighting, blender 3d style.",
        isPremium: false,
        category: "3d"
    },
    {
        id: 4,
        image: "https://image.lexica.art/full_jpg/00234208-8e69-424a-9e0d-5c6838384568",
        text: "Astronaut walking in a flower field on mars, surrealism, vibrant colors, highly detailed.",
        isPremium: true,
        category: "manzara"
    },
];

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const toast = document.getElementById('toast');
const modal = document.getElementById('ad-modal');
const watchBtn = document.getElementById('watch-ad-btn');
const closeBtn = document.getElementById('close-modal');
// YENİ: Lightbox elementleri
const imageModal = document.getElementById('image-modal');
const lightboxImg = document.getElementById('lightbox-img');

let currentPremiumPrompt = "";

/* =========================================
   GALERİYİ ÇİZME FONKSİYONU (GÜNCELLENDİ)
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

        // DİKKAT: img etiketine 'onclick' özelliği eklendi!
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
   ARAMA VE FİLTRELEME
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
   TOAST, KOPYALAMA VE REKLAM
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
    navigator.clipboard.writeText(text).then(() => {
        showToast("Prompt Başarıyla Kopyalandı! ✅");
    }).catch(err => { console.error('Hata:', err); });
}

watchBtn.addEventListener('click', () => {
    watchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reklam Yükleniyor...';
    setTimeout(() => {
        modal.classList.add('hidden');
        copyToClipboard(currentPremiumPrompt);
        watchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reklamı İzle (Demo)';
    }, 2000);
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

/* =========================================
   YENİ: LIGHTBOX (RESİM BÜYÜTME) FONKSİYONLARI
   ========================================= */
// Resmi açan fonksiyon
function openLightbox(imageUrl) {
    lightboxImg.src = imageUrl; // Tıklanan resmin linkini modalın içine koy
    imageModal.classList.remove('hidden'); // Modalı görünür yap
}

// Resmi kapatan fonksiyon
function closeLightbox(event) {
    // Eğer tıklanan yer resmin kendisi değilse (yani siyah boşluksa veya X butonuyse) kapat
    if (event.target !== lightboxImg) {
        imageModal.classList.add('hidden');
    }
}

/* =========================================
   BAŞLANGIÇ
   ========================================= */
renderGallery(prompts);