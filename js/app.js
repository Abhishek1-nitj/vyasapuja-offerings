/**
 * Srila Prabhupada Vyasa-puja Offerings Web Application
 * Editorial Minimalist Logic
 */

(function () {
  'use strict';

  const STORAGE_KEY_OFFERINGS = 'vyasapuja_offerings_db_v3';

  // Seed Data: Authentic offerings across the designated centers & BACEs
  const INITIAL_SEED_OFFERINGS = [
    {
      id: 'off-112',
      offeringNumber: 112,
      devoteeName: 'Bhakta Nitesh & Family',
      center: 'IBC AECS Layout',
      email: 'nitesh.aecs@gmail.com',
      phone: '+91 98451 23456',
      content: `Beloved Srila Prabhupada,

Warmest prostrations at your divine lotus feet on your sacred Appearance Day.

Here at IBC AECS Layout, through your causeless mercy, our congregation gathers weekly to chant the Holy Names, honor Krishna prasadam, and dive deep into your Bhagavad-gita As It Is. 

Thank you for demonstrating that pure devotional service unites all human beings in eternal brotherhood.

Your servants,
Nitesh and Family`,
      createdAt: '2026-08-17T14:40:00Z',
      wordCount: 68
    },
    {
      id: 'off-111',
      offeringNumber: 111,
      devoteeName: 'Gopal Bhatta Das',
      center: 'Modadruma BACE',
      email: 'gopal.modadruma@gmail.com',
      phone: '+91 94220 33445',
      content: `Respected Srila Prabhupada,

Dandavat Pranams at your lotus feet.

In our Modadruma BACE, young college students and tech professionals are finding life-transforming balance through your 4-principle sadhana and daily 16 rounds of japa.

Your timeless books prove every single day that Krishna Consciousness is the highest science and welfare work for humanity.

Your servant,
Gopal Bhatta Das`,
      createdAt: '2026-08-17T13:10:00Z',
      wordCount: 59
    },
    {
      id: 'off-110',
      offeringNumber: 110,
      devoteeName: 'Tulasi Manjari Dasi',
      center: 'IBC Panathur',
      email: 'tulasi.panathur@gmail.com',
      phone: '+91 98860 11223',
      content: `Dearest Srila Prabhupada,

Please accept my humble prostrations at your lotus feet.

Whenever we sit together in our weekly sanga at IBC Panathur, we remember your tireless journey aboard the Jaladuta. You saw the divine potential in everyone and gave us this transcendental family.

May we always remain sincere instruments in distributing your books and sharing your teachings.

Your humble servant,
Tulasi Manjari Dasi`,
      createdAt: '2026-08-17T11:20:00Z',
      wordCount: 65
    },
    {
      id: 'off-109',
      offeringNumber: 109,
      devoteeName: 'Krishna Kinkar Das',
      center: 'Godrum BACE',
      email: 'kkdas.godrum@gmail.com',
      phone: '+91 97330 11990',
      content: `Om Ajnana-timirandhasya Jnananjana-salakaya...

My Beloved Spiritual Master, Srila Prabhupada,

At Godrum BACE, all our boys start the morning with Mangala-arati, chanting the Holy Names and reading your Srimad-Bhagavatam purports before going to college and office. 

Grant us the purity, humility, and dedication to serve your mission unconditionally.

Your eternal servant,
Krishna Kinkar Das`,
      createdAt: '2026-08-17T09:05:00Z',
      wordCount: 58
    },
    {
      id: 'off-108',
      offeringNumber: 108,
      devoteeName: 'Sundari Gopi Dasi',
      center: 'IBC Indiranagar',
      email: 'sundari.indiranagar@gmail.com',
      phone: '+91 98101 23450',
      content: `Dearest Srila Prabhupada,

All glories to Your Divine Grace on this auspicious Vyasa-puja day!

In the bustling streets of Indiranagar, when souls receive your books, their lives take a sublime spiritual turn. Your words carry the potency of pure devotional service.

May your divine instructions continue to illuminate our hearts and guide our daily sadhana.

Your servant,
Sundari Gopi Dasi`,
      createdAt: '2026-08-17T07:15:00Z',
      wordCount: 60
    },
    {
      id: 'off-107',
      offeringNumber: 107,
      devoteeName: 'Bhakti Vinoda Priya Das',
      center: 'Panathur Lotus BACE',
      email: 'priyadas.lotus@gmail.com',
      phone: '+91 98110 56789',
      content: `Hare Krishna Srila Prabhupada,

Please accept my respectful obeisances at your divine lotus feet.

Living in Panathur Lotus BACE under your shelter is the greatest blessing of our lives. Chanting together and discussing your purports builds an unbreakable fortress of spiritual strength amidst worldly distractions.

Please bless us with humility and dedication to always serve your lotus feet.

Your grateful servant,
Bhakti Vinoda Priya Das`,
      createdAt: '2026-08-17T05:40:00Z',
      wordCount: 65
    },
    {
      id: 'off-106',
      offeringNumber: 106,
      devoteeName: 'Dr. Vikramaditya Sharma',
      center: 'IBC Sarjapur',
      email: 'vikram.sharma.sarjapur@gmail.com',
      phone: '+91 98450 78901',
      content: `Respected Srila Prabhupada,

Please accept my respectful obeisances.

As a tech researcher, I spent years analyzing material systems, yet feeling an empty void within. It was your 'Life Comes from Life' and Bhagavad-gita purports that shattered all material illusions and revealed the scientific precision of Krishna consciousness.

On your Vyasa-puja, I pray for the intelligence and devotion to share your timeless message with my colleagues and neighbors.

Your indebted servant,
Dr. Vikramaditya Sharma`,
      createdAt: '2026-08-17T02:10:00Z',
      wordCount: 74
    },
    {
      id: 'off-105',
      offeringNumber: 105,
      devoteeName: 'Ananda Maya Devi Dasi',
      center: 'IBC Inner Circle',
      email: 'anandamaya.innercircle@gmail.com',
      phone: '+91 99001 22334',
      content: `Beloved Srila Prabhupada,

Please accept my humble prostrations at your lotus feet.

Here at IBC Inner Circle, seeing families and youth singing bhajans and serving with love is a living testament to your supreme mercy. You built a home where the whole world can live in peace under the shelter of Sri Krishna.

Thank you for giving us this sublime path of Bhakti.

Your eternal servant,
Ananda Maya Devi Dasi`,
      createdAt: '2026-08-16T18:20:00Z',
      wordCount: 68
    },
    {
      id: 'off-104',
      offeringNumber: 104,
      devoteeName: 'Madhava Charan Das',
      center: 'IBC Marathahalli',
      email: 'madhavacharan.marth@gmail.com',
      phone: '+91 98200 11223',
      content: `Dearest Srila Prabhupada,

Please accept my prostrated obeisances at your lotus feet on your sacred Appearance Day.

Your unshakeable determination and deep love for Sri Chaitanya Mahaprabhu's mission is our eternal inspiration. Through our regular book distribution and Harinam in Marathahalli, we strive to bring joy to your heart.

Please bless me that my service may never become mechanical, but always remain filled with sincere love and gratitude.

Your servant,
Madhava Charan Das`,
      createdAt: '2026-08-16T14:45:00Z',
      wordCount: 74
    },
    {
      id: 'off-103',
      offeringNumber: 103,
      devoteeName: 'Bhakta Kevin & Priya',
      center: 'UVCE College BACE',
      email: 'kevin.priya.uvce@gmail.com',
      phone: '+91 97410 90123',
      content: `Respected Srila Prabhupada,

Dandavat Pranams at your divine lotus feet.

At UVCE College BACE, engineering students are finding the highest purpose of knowledge through your books. You showed us that real education means understanding our eternal relationship with the Supreme Lord.

We pray for your blessings to remain fixed in our sadhana and sankirtan service throughout our lives.

Aspiring servants,
Kevin & Priya`,
      createdAt: '2026-08-16T12:00:00Z',
      wordCount: 64
    },
    {
      id: 'off-102',
      offeringNumber: 102,
      devoteeName: 'Radha Kunda Dasi',
      center: 'Antardvipa BACE',
      email: 'radhakunda.antardvipa@gmail.com',
      phone: '+91 99270 44551',
      content: `My Dear Srila Prabhupada,

Please accept my millions of humble obeisances.

Your books remain our eternal lifeblood and guiding light. Whenever doubt or fatigue enters the mind, your purports illuminate the path with resolute truth. 

May I always remain an humble servant of your servants, dedicated to your sankirtan mission.

Your spiritual daughter,
Radha Kunda Dasi`,
      createdAt: '2026-08-16T10:15:00Z',
      wordCount: 57
    },
    {
      id: 'off-101',
      offeringNumber: 101,
      devoteeName: 'Gauranga Sundar Das',
      center: 'Bellandur BACE',
      email: 'gauranga.bellandur@gmail.com',
      phone: '+91 98321 00108',
      content: `nama oṁ viṣṇu-pādāya kṛṣṇa-preṣṭhāya bhū-tale
śrīmate bhaktivedānta-svāmin iti nāmine

namas te sārasvate deve gaura-vāṇī-pracāriṇe
nirviśeṣa-śūnyavādi-pāścātya-deśa-tāriṇe

Dearest Srila Prabhupada,

On this most auspicious day of your Divine Appearance, Sri Vyasa-puja, I fall flat at the dust of your lotus feet in deepest reverence and gratitude. 

When you boarded the Jaladuta at the age of seventy, carrying solely forty rupees and your Srimad-Bhagavatam translations, you transformed the spiritual destiny of humanity. 

Please grant me the benediction to serve your sankirtan mission unconditionally till my last breath.

Your insignificant servant,
Gauranga Sundar Das`,
      createdAt: '2026-08-16T08:30:00Z',
      wordCount: 102
    }
  ];

  // State
  const AppState = {
    offerings: [],
    currentPage: 1,
    pageSize: 9
  };

  // DOM Elements Cache
  const DOM = {
    mainSubmitBtn: document.getElementById('mainSubmitBtn'),
    totalOfferingsCountBadge: document.getElementById('totalOfferingsCountBadge'),
    offeringsGrid: document.getElementById('offeringsGrid'),
    emptyOfferingsState: document.getElementById('emptyOfferingsState'),
    emptyStateSubmitBtn: document.getElementById('emptyStateSubmitBtn'),

    paginationWrapper: document.getElementById('paginationWrapper'),
    paginationInfo: document.getElementById('paginationInfo'),
    paginationNumbers: document.getElementById('paginationNumbers'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),

    submissionModal: document.getElementById('submissionModal'),
    closeSubmissionModalBtn: document.getElementById('closeSubmissionModalBtn'),
    cancelSubmissionBtn: document.getElementById('cancelSubmissionBtn'),
    offeringForm: document.getElementById('offeringForm'),
    devoteeName: document.getElementById('devoteeName'),
    centerSelect: document.getElementById('centerSelect'),
    customCenterGroup: document.getElementById('customCenterGroup'),
    customCenterName: document.getElementById('customCenterName'),
    devoteeEmail: document.getElementById('devoteeEmail'),
    devoteePhone: document.getElementById('devoteePhone'),
    offeringContent: document.getElementById('offeringContent'),
    wordCounterBadge: document.getElementById('wordCounterBadge'),

    readerModal: document.getElementById('readerModal'),
    closeReaderModalBtn: document.getElementById('closeReaderModalBtn'),
    closeReaderFooterBtn: document.getElementById('closeReaderFooterBtn'),
    readerOfferingNumber: document.getElementById('readerOfferingNumber'),
    readerCenterBadge: document.getElementById('readerCenterBadge'),
    readerDate: document.getElementById('readerDate'),
    readerAuthorName: document.getElementById('readerAuthorName'),
    readerAuthorCenter: document.getElementById('readerAuthorCenter'),
    readerOfferingContent: document.getElementById('readerOfferingContent'),
    copyOfferingLinkBtn: document.getElementById('copyOfferingLinkBtn'),

    toastContainer: document.getElementById('toastContainer')
  };

  function init() {
    loadOfferings();
    bindEvents();
    renderFeedAndPagination();
    checkUrlHashForOffering();
  }

  function loadOfferings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFERINGS);
      if (stored) {
        AppState.offerings = JSON.parse(stored);
      } else {
        AppState.offerings = [...INITIAL_SEED_OFFERINGS];
        saveOfferings();
      }
    } catch (e) {
      AppState.offerings = [...INITIAL_SEED_OFFERINGS];
    }
  }

  function saveOfferings() {
    try {
      localStorage.setItem(STORAGE_KEY_OFFERINGS, JSON.stringify(AppState.offerings));
    } catch (e) {
      console.error(e);
    }
  }

  function bindEvents() {
    if (DOM.mainSubmitBtn) {
      DOM.mainSubmitBtn.addEventListener('click', openSubmissionModal);
    }
    if (DOM.emptyStateSubmitBtn) {
      DOM.emptyStateSubmitBtn.addEventListener('click', openSubmissionModal);
    }

    DOM.closeSubmissionModalBtn.addEventListener('click', closeSubmissionModal);
    DOM.cancelSubmissionBtn.addEventListener('click', closeSubmissionModal);

    DOM.centerSelect.addEventListener('change', (e) => {
      if (e.target.value === '__OTHER__') {
        DOM.customCenterGroup.classList.remove('hidden');
        DOM.customCenterName.focus();
      } else {
        DOM.customCenterGroup.classList.add('hidden');
        DOM.customCenterName.value = '';
      }
    });

    // Sanitize phone number input to allow only digits and max 10
    DOM.devoteePhone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });

    DOM.offeringContent.addEventListener('input', updateWordCounter);
    DOM.offeringForm.addEventListener('submit', handleFormSubmit);

    DOM.closeReaderModalBtn.addEventListener('click', closeReaderModal);
    DOM.closeReaderFooterBtn.addEventListener('click', closeReaderModal);
    DOM.copyOfferingLinkBtn.addEventListener('click', copyOfferingLink);

    DOM.prevPageBtn.addEventListener('click', () => {
      if (AppState.currentPage > 1) {
        AppState.currentPage--;
        renderFeedAndPagination();
        scrollToSection();
      }
    });

    DOM.nextPageBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(AppState.offerings.length / AppState.pageSize);
      if (AppState.currentPage < maxPage) {
        AppState.currentPage++;
        renderFeedAndPagination();
        scrollToSection();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSubmissionModal();
        closeReaderModal();
      }
    });

    [DOM.submissionModal, DOM.readerModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
          }
        });
      }
    });
  }

  function cleanCenterName(center) {
    if (!center) return '';
    return center.replace(/\s*\([^)]*\)/g, '').trim();
  }

  /**
   * Render Feed Grid with Editorial Cards (No Initials Circles)
   */
  function renderFeedAndPagination() {
    const list = [...AppState.offerings];

    // Chronological: latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    DOM.totalOfferingsCountBadge.textContent = `${total} ${total === 1 ? 'Offering' : 'Offerings'}`;

    const pageSize = AppState.pageSize;
    const totalPages = Math.ceil(total / pageSize) || 1;

    if (AppState.currentPage > totalPages) AppState.currentPage = totalPages;

    const startIndex = (AppState.currentPage - 1) * pageSize;
    const pageItems = list.slice(startIndex, startIndex + pageSize);

    DOM.offeringsGrid.innerHTML = '';

    if (total === 0) {
      DOM.offeringsGrid.classList.add('hidden');
      DOM.emptyOfferingsState.classList.remove('hidden');
      DOM.paginationWrapper.classList.add('hidden');
      return;
    }

    DOM.offeringsGrid.classList.remove('hidden');
    DOM.emptyOfferingsState.classList.add('hidden');
    DOM.paginationWrapper.classList.remove('hidden');

    pageItems.forEach((offering, idx) => {
      const card = document.createElement('article');
      card.className = 'offering-card';
      card.setAttribute('data-id', offering.id);

      const formattedDate = formatDate(offering.createdAt);
      const excerpt = createExcerpt(offering.content, 220);
      const displayCenter = cleanCenterName(offering.center);
      const indexNum = String(startIndex + idx + 1).padStart(2, '0');

      card.innerHTML = `
        <div class="card-top">
          <span class="card-index">${indexNum}</span>
          <span class="card-center">${escapeHtml(displayCenter)}</span>
        </div>
        <h3 class="card-author-name">${escapeHtml(offering.devoteeName)}</h3>
        <p class="card-content-preview">${escapeHtml(excerpt)}</p>
        <div class="card-footer">
          <span class="card-date">${formattedDate}</span>
          <button class="btn-read-link" data-offering-id="${offering.id}">
            Read full homage →
          </button>
        </div>
      `;

      card.querySelector('.btn-read-link').addEventListener('click', (e) => {
        e.stopPropagation();
        openReaderModal(offering.id);
      });

      card.addEventListener('click', () => {
        openReaderModal(offering.id);
      });

      DOM.offeringsGrid.appendChild(card);
    });

    const endCount = Math.min(startIndex + pageSize, total);
    DOM.paginationInfo.textContent = `Showing ${startIndex + 1}–${endCount} of ${total} offerings`;
    DOM.prevPageBtn.disabled = AppState.currentPage === 1;
    DOM.nextPageBtn.disabled = AppState.currentPage === totalPages;

    renderPaginationNumbers(totalPages);
  }

  function renderPaginationNumbers(totalPages) {
    DOM.paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 6 && Math.abs(i - AppState.currentPage) > 2 && i !== 1 && i !== totalPages) {
        continue;
      }
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-num-btn ${i === AppState.currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        AppState.currentPage = i;
        renderFeedAndPagination();
        scrollToSection();
      });
      DOM.paginationNumbers.appendChild(pageBtn);
    }
  }

  function scrollToSection() {
    const section = document.querySelector('.offerings-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateWordCounter() {
    const text = DOM.offeringContent.value;
    const words = countWords(text);
    DOM.wordCounterBadge.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  }

  function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function openSubmissionModal() {
    DOM.submissionModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    DOM.devoteeName.focus();
  }

  function closeSubmissionModal() {
    DOM.submissionModal.classList.add('hidden');
    document.body.style.overflow = '';
    resetFormErrors();
  }

  function resetFormErrors() {
    document.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
      el.classList.remove('visible');
    });
    document.querySelectorAll('.form-control').forEach((el) => {
      el.classList.remove('is-invalid');
    });
    const phoneGroup = document.querySelector('.phone-input-group');
    if (phoneGroup) phoneGroup.classList.remove('is-invalid');
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    resetFormErrors();

    const name = DOM.devoteeName.value.trim();
    let center = DOM.centerSelect.value;
    if (center === '__OTHER__') {
      center = DOM.customCenterName.value.trim();
    }
    const email = DOM.devoteeEmail.value.trim();
    const rawPhone = DOM.devoteePhone.value.replace(/\D/g, '').trim();
    const content = DOM.offeringContent.value.trim();

    let hasError = false;

    if (!name) {
      showFieldError('devoteeNameError', DOM.devoteeName, 'Please enter your name.');
      hasError = true;
    }

    if (!center) {
      showFieldError('centerError', DOM.centerSelect, 'Please select your center.');
      hasError = true;
    }

    if (!email || !validateEmail(email)) {
      showFieldError('emailError', DOM.devoteeEmail, 'Please enter a valid email.');
      hasError = true;
    }

    if (!rawPhone || rawPhone.length !== 10) {
      showFieldError('phoneError', DOM.devoteePhone, 'Please enter a valid 10-digit phone number.');
      const phoneGroup = document.querySelector('.phone-input-group');
      if (phoneGroup) phoneGroup.classList.add('is-invalid');
      hasError = true;
    }

    if (!content || content.length < 20) {
      showFieldError('contentError', DOM.offeringContent, 'Please write your offering text.');
      hasError = true;
    }

    if (hasError) return;

    const highestNum = AppState.offerings.reduce((max, off) => Math.max(max, off.offeringNumber || 0), 100);
    const nextOfferingNumber = highestNum + 1;

    const newOffering = {
      id: `off-${Date.now()}`,
      offeringNumber: nextOfferingNumber,
      devoteeName: name,
      center: center,
      email: email,
      phone: `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}`,
      content: content,
      createdAt: new Date().toISOString(),
      wordCount: countWords(content)
    };

    AppState.offerings.unshift(newOffering);
    saveOfferings();

    DOM.offeringForm.reset();
    DOM.customCenterGroup.classList.add('hidden');
    updateWordCounter();

    closeSubmissionModal();
    AppState.currentPage = 1;
    renderFeedAndPagination();
    scrollToSection();

    showToast('Your offering has been gratefully received 🙏');
  }

  function showFieldError(errorId, inputElement, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (inputElement) {
      inputElement.classList.add('is-invalid');
      inputElement.focus();
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function openReaderModal(offeringId) {
    const offering = AppState.offerings.find((o) => o.id === offeringId);
    if (!offering) return;

    DOM.readerOfferingNumber = document.getElementById('readerOfferingNumber');
    if (DOM.readerOfferingNumber) {
      DOM.readerOfferingNumber.textContent = `#${offering.offeringNumber}`;
    }
    DOM.readerCenterBadge.textContent = cleanCenterName(offering.center);
    DOM.readerDate.textContent = formatDate(offering.createdAt);
    DOM.readerAuthorName.textContent = offering.devoteeName;
    DOM.readerAuthorCenter.textContent = offering.center;
    DOM.readerOfferingContent.textContent = offering.content;

    window.location.hash = `offering-${offering.offeringNumber}`;

    DOM.readerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeReaderModal() {
    DOM.readerModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (window.location.hash.startsWith('#offering-')) {
      history.replaceState(null, null, ' ');
    }
  }

  function copyOfferingLink() {
    const currentUrl = window.location.href.split('#')[0] + window.location.hash;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Link copied to clipboard');
      });
    } else {
      showToast(`URL: ${currentUrl}`);
    }
  }

  function checkUrlHashForOffering() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#offering-')) {
      const numStr = hash.replace('#offering-', '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        const found = AppState.offerings.find((o) => o.offeringNumber === num);
        if (found) {
          openReaderModal(found.id);
        }
      }
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function createExcerpt(text, length = 180) {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= length) return clean;
    return clean.slice(0, length) + '...';
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
