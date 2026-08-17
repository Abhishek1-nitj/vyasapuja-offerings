(function () {
  'use strict';
  const API = '/api/offerings';
  const AppState = { offerings: [], currentPage: 1, pageSize: 9 };
  const AuthState = { clientId: '', credential: '', email: '', name: '', ready: false, afterLogin: null };
  const $ = (id) => document.getElementById(id);
  const DOM = {
    mainSubmitBtn: $('mainSubmitBtn'), totalOfferingsCountBadge: $('totalOfferingsCountBadge'), offeringsGrid: $('offeringsGrid'),
    emptyOfferingsState: $('emptyOfferingsState'), emptyStateSubmitBtn: $('emptyStateSubmitBtn'), paginationWrapper: $('paginationWrapper'),
    paginationInfo: $('paginationInfo'), paginationNumbers: $('paginationNumbers'), prevPageBtn: $('prevPageBtn'), nextPageBtn: $('nextPageBtn'),
    submissionModal: $('submissionModal'), closeSubmissionModalBtn: $('closeSubmissionModalBtn'), cancelSubmissionBtn: $('cancelSubmissionBtn'),
    offeringForm: $('offeringForm'), editingOfferingId: $('editingOfferingId'), submissionModalTitle: $('submissionModalTitle'),
    submitOfferingBtn: $('submitOfferingBtn'), devoteeName: $('devoteeName'), centerSelect: $('centerSelect'), customCenterGroup: $('customCenterGroup'),
    customCenterName: $('customCenterName'), devoteeEmail: $('devoteeEmail'), devoteePhone: $('devoteePhone'), offeringContent: $('offeringContent'),
    wordCounterBadge: $('wordCounterBadge'), searchForm: $('offeringSearchForm'), searchInput: $('offeringSearchInput'), searchResults: $('searchResults'),
    readerModal: $('readerModal'), closeReaderModalBtn: $('closeReaderModalBtn'), closeReaderFooterBtn: $('closeReaderFooterBtn'),
    readerOfferingNumber: $('readerOfferingNumber'), readerCenterBadge: $('readerCenterBadge'), readerDate: $('readerDate'), readerAuthorName: $('readerAuthorName'),
    readerAuthorCenter: $('readerAuthorCenter'), readerOfferingContent: $('readerOfferingContent'), copyOfferingLinkBtn: $('copyOfferingLinkBtn'),
    toastContainer: $('toastContainer'), authModal: $('authModal'), closeAuthModalBtn: $('closeAuthModalBtn'),
    googleSignInButton: $('googleSignInButton'), signedInBadge: $('signedInBadge')
  };

  async function init() {
    bindEvents();
    await setupGoogle();
    await loadOfferings();
    checkUrlHashForOffering();
  }

  async function requestJson(url, options = {}) {
    const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
    if (AuthState.credential) headers.authorization = `Bearer ${AuthState.credential}`;
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  async function setupGoogle() {
    try {
      AuthState.clientId = (await requestJson('/api/auth/config')).googleClientId || '';
      if (!AuthState.clientId || AuthState.clientId === 'REPLACE_WITH_GOOGLE_CLIENT_ID') {
        DOM.signedInBadge.textContent = 'Google login not configured';
        DOM.signedInBadge.classList.remove('hidden');
        return;
      }
      await waitForGoogle();
      google.accounts.id.initialize({ client_id: AuthState.clientId, callback: handleGoogleCredential });
      google.accounts.id.renderButton(DOM.googleSignInButton, { theme: 'outline', size: 'large', width: 260 });
      AuthState.ready = true;
    } catch (e) {
      showToast('Google login could not load.');
    }
  }

  function waitForGoogle() {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(timer); resolve(); }
        if (++tries > 60) { clearInterval(timer); reject(new Error('Google unavailable')); }
      }, 100);
    });
  }

  function handleGoogleCredential(response) {
    AuthState.credential = response.credential;
    const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    AuthState.email = payload.email || '';
    AuthState.name = payload.name || '';
    DOM.signedInBadge.textContent = `Signed in as ${AuthState.email}`;
    DOM.signedInBadge.classList.remove('hidden');
    if (!DOM.editingOfferingId.value && !DOM.devoteeEmail.value) DOM.devoteeEmail.value = AuthState.email;
    showToast('Google sign-in complete.');
    closeAuthModal();
    if (AuthState.afterLogin) {
      const next = AuthState.afterLogin;
      AuthState.afterLogin = null;
      next();
    }
  }

  function requireGoogle(next) {
    if (AuthState.credential) return true;
    AuthState.afterLogin = next || null;
    openAuthModal();
    return false;
  }

  function openAuthModal() {
    DOM.signedInBadge.textContent = AuthState.ready ? '' : 'Google login is not configured yet.';
    DOM.signedInBadge.classList.toggle('hidden', AuthState.ready);
    DOM.authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    DOM.authModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function loadOfferings() {
    try {
      AppState.offerings = (await requestJson(API)).offerings || [];
    } catch (e) {
      showToast(e.message);
    }
    renderFeedAndPagination();
  }

  function bindEvents() {
    DOM.mainSubmitBtn.addEventListener('click', () => {
      if (requireGoogle(() => openSubmissionModal())) openSubmissionModal();
    });
    DOM.emptyStateSubmitBtn.addEventListener('click', () => {
      if (requireGoogle(() => openSubmissionModal())) openSubmissionModal();
    });
    DOM.closeAuthModalBtn.addEventListener('click', closeAuthModal);
    DOM.closeSubmissionModalBtn.addEventListener('click', closeSubmissionModal);
    DOM.cancelSubmissionBtn.addEventListener('click', closeSubmissionModal);
    DOM.centerSelect.addEventListener('change', toggleCustomCenter);
    DOM.devoteePhone.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
    DOM.offeringContent.addEventListener('input', updateWordCounter);
    DOM.offeringForm.addEventListener('submit', handleFormSubmit);
    DOM.searchForm.addEventListener('submit', handleSearch);
    DOM.closeReaderModalBtn.addEventListener('click', closeReaderModal);
    DOM.closeReaderFooterBtn.addEventListener('click', closeReaderModal);
    DOM.copyOfferingLinkBtn.addEventListener('click', copyOfferingLink);
    DOM.prevPageBtn.addEventListener('click', () => changePage(-1));
    DOM.nextPageBtn.addEventListener('click', () => changePage(1));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAuthModal(); closeSubmissionModal(); closeReaderModal(); } });
    [DOM.authModal, DOM.submissionModal, DOM.readerModal].forEach((modal) => modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.classList.add('hidden'); document.body.style.overflow = ''; }
    }));
  }

  function toggleCustomCenter(e) {
    const custom = e.target.value === '__OTHER__';
    DOM.customCenterGroup.classList.toggle('hidden', !custom);
    if (custom) DOM.customCenterName.focus(); else DOM.customCenterName.value = '';
  }

  function renderFeedAndPagination() {
    const list = [...AppState.offerings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    DOM.totalOfferingsCountBadge.textContent = `${total} ${total === 1 ? 'Offering' : 'Offerings'}`;
    const totalPages = Math.ceil(total / AppState.pageSize) || 1;
    if (AppState.currentPage > totalPages) AppState.currentPage = totalPages;
    const startIndex = (AppState.currentPage - 1) * AppState.pageSize;
    const pageItems = list.slice(startIndex, startIndex + AppState.pageSize);
    DOM.offeringsGrid.innerHTML = '';
    DOM.offeringsGrid.classList.toggle('hidden', total === 0);
    DOM.emptyOfferingsState.classList.toggle('hidden', total !== 0);
    DOM.paginationWrapper.classList.toggle('hidden', total === 0);
    pageItems.forEach((offering, idx) => DOM.offeringsGrid.appendChild(cardFor(offering, startIndex + idx + 1)));
    DOM.paginationInfo.textContent = `Showing ${startIndex + 1}-${Math.min(startIndex + AppState.pageSize, total)} of ${total} offerings`;
    DOM.prevPageBtn.disabled = AppState.currentPage === 1;
    DOM.nextPageBtn.disabled = AppState.currentPage === totalPages;
    renderPaginationNumbers(totalPages);
  }

  function cardFor(offering, index) {
    const card = document.createElement('article');
    card.className = 'offering-card';
    card.innerHTML = `
      <div class="card-top"><span class="card-index">${String(index).padStart(2, '0')}</span><span class="card-center">${esc(cleanCenterName(offering.center))}</span></div>
      <h3 class="card-author-name">${esc(offering.devoteeName)}</h3>
      <p class="card-content-preview">${esc(createExcerpt(offering.content, 220))}</p>
      <div class="card-footer"><span class="card-date">${formatDate(offering.createdAt)}</span><button class="btn-read-link">Read full homage -></button></div>`;
    card.addEventListener('click', () => openReaderModal(offering.id));
    card.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); openReaderModal(offering.id); });
    return card;
  }

  function renderPaginationNumbers(totalPages) {
    DOM.paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 6 && Math.abs(i - AppState.currentPage) > 2 && i !== 1 && i !== totalPages) continue;
      const btn = document.createElement('button');
      btn.className = `page-num-btn ${i === AppState.currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { AppState.currentPage = i; renderFeedAndPagination(); scrollToSection(); });
      DOM.paginationNumbers.appendChild(btn);
    }
  }

  function changePage(delta) {
    const maxPage = Math.ceil(AppState.offerings.length / AppState.pageSize);
    const next = AppState.currentPage + delta;
    if (next >= 1 && next <= maxPage) { AppState.currentPage = next; renderFeedAndPagination(); scrollToSection(); }
  }

  async function handleSearch(e) {
    e.preventDefault();
    DOM.searchResults.classList.remove('hidden');
    DOM.searchResults.textContent = 'Searching...';
    try {
      renderSearchResults((await requestJson(`${API}/search`, { method: 'POST', body: JSON.stringify({ query: DOM.searchInput.value }) })).results || []);
    } catch (err) {
      DOM.searchResults.textContent = err.message;
    }
  }

  function renderSearchResults(results) {
    if (!results.length) { DOM.searchResults.textContent = 'No offering found.'; return; }
    DOM.searchResults.innerHTML = '';
    results.forEach((offering) => {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.innerHTML = `<div><strong>${esc(offering.devoteeName)}</strong><span>${esc(offering.center)} - ${esc(offering.emailMasked)} - ${esc(offering.phoneMasked)}</span></div><button class="page-nav-btn">Edit</button>`;
      row.querySelector('button').addEventListener('click', () => openOwnedOffering(offering.id));
      DOM.searchResults.appendChild(row);
    });
  }

  async function openOwnedOffering(id) {
    if (!requireGoogle(() => openOwnedOffering(id))) return;
    try {
      openSubmissionModal((await requestJson(`${API}/${id}`)).offering);
    } catch (e) {
      showToast(e.message);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!requireGoogle()) return;
    resetFormErrors();
    const payload = getFormPayload();
    const error = validate(payload);
    if (error) return showFieldError(error.id, error.el, error.message);
    const isEdit = Boolean(DOM.editingOfferingId.value);
    try {
      if (isEdit) {
        await requestJson(`${API}/${DOM.editingOfferingId.value}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Offering updated.');
      } else {
        await requestJson(API, { method: 'POST', body: JSON.stringify(payload) });
        showToast('Offering submitted.');
      }
      closeSubmissionModal();
      AppState.currentPage = 1;
      await loadOfferings();
      scrollToSection();
    } catch (err) {
      showToast(err.message);
    }
  }

  function getFormPayload() {
    const center = DOM.centerSelect.value === '__OTHER__' ? DOM.customCenterName.value.trim() : DOM.centerSelect.value;
    return {
      devoteeName: DOM.devoteeName.value.trim(),
      center,
      email: DOM.devoteeEmail.value.trim(),
      phone: DOM.devoteePhone.value.replace(/\D/g, ''),
      content: DOM.offeringContent.value.trim()
    };
  }

  function validate(p) {
    if (!p.devoteeName) return { id: 'devoteeNameError', el: DOM.devoteeName, message: 'Please enter your name.' };
    if (!p.center) return { id: 'centerError', el: DOM.centerSelect, message: 'Please select your center.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return { id: 'emailError', el: DOM.devoteeEmail, message: 'Please enter a valid email.' };
    if (p.phone.length !== 10) return { id: 'phoneError', el: DOM.devoteePhone, message: 'Please enter a valid 10-digit phone number.' };
    if (p.content.length < 20) return { id: 'contentError', el: DOM.offeringContent, message: 'Please write your offering text.' };
    return null;
  }

  function openSubmissionModal(offering) {
    resetFormErrors();
    DOM.offeringForm.reset();
    DOM.customCenterGroup.classList.add('hidden');
    const isEdit = Boolean(offering);
    DOM.editingOfferingId.value = isEdit ? offering.id : '';
    DOM.submissionModalTitle.textContent = isEdit ? 'Edit Your Offering' : 'Submit Your Offering';
    DOM.submitOfferingBtn.querySelector('span').textContent = isEdit ? 'Save Changes' : 'Submit Offering';
    if (isEdit) fillForm(offering); else if (AuthState.email) DOM.devoteeEmail.value = AuthState.email;
    updateWordCounter();
    DOM.submissionModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    DOM.devoteeName.focus();
  }

  function fillForm(o) {
    DOM.devoteeName.value = o.devoteeName || '';
    setCenter(o.center || '');
    DOM.devoteeEmail.value = o.email || '';
    DOM.devoteePhone.value = (o.phone || '').replace(/\D/g, '').slice(-10);
    DOM.offeringContent.value = o.content || '';
  }

  function setCenter(center) {
    const found = [...DOM.centerSelect.options].some((opt) => opt.value === center);
    DOM.centerSelect.value = found ? center : '__OTHER__';
    DOM.customCenterGroup.classList.toggle('hidden', found);
    DOM.customCenterName.value = found ? '' : center;
  }

  function closeSubmissionModal() {
    DOM.submissionModal.classList.add('hidden');
    document.body.style.overflow = '';
    resetFormErrors();
  }

  function openReaderModal(id) {
    const offering = AppState.offerings.find((o) => o.id === id);
    if (!offering) return;
    DOM.readerOfferingNumber.textContent = `#${offering.offeringNumber}`;
    DOM.readerCenterBadge.textContent = cleanCenterName(offering.center);
    DOM.readerDate.textContent = formatDate(offering.createdAt);
    DOM.readerAuthorName.textContent = offering.devoteeName;
    DOM.readerAuthorCenter.textContent = offering.center;
    DOM.readerOfferingContent.textContent = offering.content;
    window.location.hash = `offering-${offering.offeringNumber}`;
    DOM.readerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function resetFormErrors() {
    document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; el.classList.remove('visible'); });
    document.querySelectorAll('.form-control').forEach((el) => el.classList.remove('is-invalid'));
    document.querySelector('.phone-input-group')?.classList.remove('is-invalid');
  }
  function showFieldError(errorId, inputElement, message) {
    const errorEl = $(errorId);
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add('visible'); }
    inputElement?.classList.add('is-invalid');
    inputElement?.focus();
    if (errorId === 'phoneError') document.querySelector('.phone-input-group')?.classList.add('is-invalid');
  }
  function updateWordCounter() {
    const words = (DOM.offeringContent.value || '').trim().split(/\s+/).filter(Boolean).length;
    DOM.wordCounterBadge.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  }
  function closeReaderModal() {
    DOM.readerModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (window.location.hash.startsWith('#offering-')) history.replaceState(null, null, ' ');
  }
  function copyOfferingLink() {
    const currentUrl = window.location.href.split('#')[0] + window.location.hash;
    navigator.clipboard?.writeText(currentUrl).then(() => showToast('Link copied to clipboard')).catch(() => showToast(currentUrl));
  }
  function checkUrlHashForOffering() {
    const num = parseInt(window.location.hash.replace('#offering-', ''), 10);
    const found = AppState.offerings.find((o) => o.offeringNumber === num);
    if (found) openReaderModal(found.id);
  }
  function scrollToSection() { document.querySelector('.offerings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(12px)'; setTimeout(() => toast.remove(), 250); }, 2800);
  }
  function cleanCenterName(center) { return (center || '').replace(/\s*\([^)]*\)/g, '').trim(); }
  function formatDate(isoStr) { return isoStr ? new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
  function createExcerpt(text, length = 180) { const clean = (text || '').replace(/\s+/g, ' ').trim(); return clean.length <= length ? clean : `${clean.slice(0, length)}...`; }
  function esc(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
