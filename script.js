/**
 * FalGir - فال‌گیر | سامانه تفأل به دیوان حافظ شیرازی
 * Pure Vanilla JavaScript (No external libraries)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. STATE & CONSTANTS
  // =========================================================================
  const STATE = {
    faals: [],
    currentFaal: null,
    currentFaalIndex: null,
    isLoading: true,
    isDivinating: false,
    soundEnabled: true,
    audioCtx: null,
  };

  // چند غزل پشتیبان برای مواقعی که فایل JSON به دلیل باز شدن روی پروتکل file:// لود نشود
  const FALLBACK_FAALS = [
    {
      poem: "الا یا ایها الساقی ادر کأسا و ناولها\r\nکه عشق آسان نمود اول ولی افتاد مشکل‌ها\r\nبه بوی نافه‌ای کاخر صبا زان طره بگشاید\r\nز تاب جعد مشکینش چه خون افتاد در دل‌ها\r\nمرا در منزل جانان چه امن عیش چون هر دم\r\nجرس فریاد می‌دارد که بربندید محمل‌ها\r\nبه می سجاده رنگین کن گرت پیر مغان گوید\r\nکه سالک بی‌خبر نبود ز راه و رسم منزل‌ها\r\nشب تاریک و بیم موج و گردابی چنین هایل\r\nکجا دانند حال ما سبکباران ساحل‌ها\r\nهمه کارم ز خود کامی به بدنامی کشید آخر\r\nنهان کی ماند آن رازی کز او سازند محفل‌ها\r\nحضوری گر همی‌خواهی از او غایب مشو حافظ\r\nمتی ما تلق من تهوی دع الدنیا و اهملها",
      interpretation: "مشکلاتتان به‌زودی حل خواهد شد و شما به نیت خودتان خواهید رسید. بعد از تاریکی و غم، روشنایی در انتظار شماست. به توصیه‌های افراد دلسوز و باتجربه گوش فرا دهید و به خدا توکل کنید."
    },
    {
      poem: "صلاح کار کجا و من خراب کجا\r\nببین تفاوت ره کز کجاست تا به کجا\r\nدلم ز صومعه بگرفت و خرقه سالوس\r\nکجاست دیر مغان و شراب ناب کجا\r\nچه نسبت است به رندی صلاح و تقوا را\r\nسماع وعظ کجا نغمه رباب کجا\r\nز روی دوست دل دشمنان چه دریابد\r\nچراغ مرده کجا شمع آفتاب کجا\r\nچو کحل بینش ما خاک آستان شماست\r\nکجا رویم بفرما از این جناب کجا\r\nمبین به سیب زنخدان که چاه در راه است\r\nکجا همی‌روی ای دل بدین شتاب کجا\r\nبشد که یاد خوشش باد روزگار وصال\r\nخود آن کرشمه کجا رفت و آن عتاب کجا\r\nقرار و خواب ز حافظ طمع مدار ای دوست\r\nقرار چیست صبوری کدام و خواب کجا",
      interpretation: "در تصمیم‌گیری شتاب نکنید و عاقبت‌اندیش باشید. راهی که برگزیده‌اید نیاز به تدبیر دارد. از ریاکاری و دورویی پرهیز کنید و بر عهد و پیمان خود استوار بمانید تا به مقصود برسید."
    },
    {
      poem: "صحن بستان ذوق بخش و صحبت یاران خوش است\r\nوقت گل خوش باد کز وی وقت میخواران خوش است\r\nاز صبا هر دم مشام جان ما خوش می‌شود\r\nآری آری طیب انفاس هواداران خوش است\r\nناگشوده گل نقاب آهنگ رحلت ساز کرد\r\nناله کن بلبل که گلبانگ دل افکاران خوش است\r\nمرغ خوشخوان را بشارت باد کاندر باغ شاه\r\nفر بلبل با نگارین کبک و باز آراسته است\r\nحافظا چون غم و شادی جهان در گذر است\r\nبهتر آن است که من خاطر خود خوش دارم",
      interpretation: "خبرهای خوشی در راه است و روزهای شادمانی فرا می‌رسد. قدر همنشینان نیک و لحظات عمر را بدانید و از وسواس‌های بیهوده دوری گزینید. امید به آینده بهترین سرمایه شماست."
    }
  ];

  // =========================================================================
  // 2. DOM ELEMENTS
  // =========================================================================
  const DOM = {
    // Stages
    niyyatStage: document.getElementById('niyyatStage'),
    resultStage: document.getElementById('resultStage'),
    
    // 3D Book & Divination elements
    bookScene: document.getElementById('bookScene'),
    book3D: document.getElementById('book3D'),
    bookFrontCover: document.getElementById('bookFrontCover'),
    btnDivinate: document.getElementById('btnDivinate'),
    ritualStatus: document.getElementById('ritualStatus'),
    ritualMsg: document.getElementById('ritualMsg'),
    
    // Manuscript Result Elements
    manuscriptCard: document.getElementById('manuscriptCard'),
    ghazalTitle: document.getElementById('ghazalTitle'),
    poemContainer: document.getElementById('poemContainer'),
    interpretationCard: document.getElementById('interpretationCard'),
    interpText: document.getElementById('interpText'),
    
    // Actions
    btnTryAgain: document.getElementById('btnTryAgain'),
    btnCopyFal: document.getElementById('btnCopyFal'),
    btnShareFal: document.getElementById('btnShareFal'),
    btnPrintFal: document.getElementById('btnPrintFal'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    soundIcon: document.getElementById('soundIcon'),
    
    // Modals
    btnSearchModal: document.getElementById('btnSearchModal'),
    searchModal: document.getElementById('searchModal'),
    btnCloseSearchModal: document.getElementById('btnCloseSearchModal'),
    ghazalNumberInput: document.getElementById('ghazalNumberInput'),
    btnJumpToNumber: document.getElementById('btnJumpToNumber'),
    ghazalSearchInput: document.getElementById('ghazalSearchInput'),
    searchResultsList: document.getElementById('searchResultsList'),
    
    btnAboutModal: document.getElementById('btnAboutModal'),
    aboutModal: document.getElementById('aboutModal'),
    btnCloseAboutModal: document.getElementById('btnCloseAboutModal'),
    
    // Toast & Particles
    toast: document.getElementById('toastNotification'),
    toastMsg: document.getElementById('toastMsg'),
    toastIcon: document.getElementById('toastIcon'),
    particlesContainer: document.getElementById('particlesContainer'),
  };

  // =========================================================================
  // 3. SOUND SYNTHESIZER (Pure Web Audio API - Zero External Assets)
  // =========================================================================
  class SoundEffects {
    constructor() {
      this.initFromStorage();
    }

    initFromStorage() {
      const stored = localStorage.getItem('falgir_sound');
      STATE.soundEnabled = stored === null ? true : stored === 'true';
      this.updateUI();
    }

    toggle() {
      STATE.soundEnabled = !STATE.soundEnabled;
      localStorage.setItem('falgir_sound', STATE.soundEnabled.toString());
      this.updateUI();
      if (STATE.soundEnabled) {
        this.playSingingBowl(528, 0.4);
      }
    }

    updateUI() {
      if (DOM.soundIcon) {
        DOM.soundIcon.textContent = STATE.soundEnabled ? '🔊' : '🔇';
        DOM.btnSoundToggle.title = STATE.soundEnabled ? 'صدا: فعال' : 'صدا: خاموش';
      }
    }

    getContext() {
      if (!STATE.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          STATE.audioCtx = new AudioCtx();
        }
      }
      if (STATE.audioCtx && STATE.audioCtx.state === 'suspended') {
        STATE.audioCtx.resume();
      }
      return STATE.audioCtx;
    }

    /**
     * نوای زنگ کاسه تبتی / نوای عرفانی هماهنگ (Singing Bowl / Meditative Chime)
     */
    playSingingBowl(freq = 432, duration = 2.4) {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const root = ctx.createGain();
        root.gain.setValueAtTime(0.001, now);
        root.gain.linearRampToValueAtTime(0.18, now + 0.08);
        root.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        root.connect(ctx.destination);

        // ترکیب هارمونیک‌های عرفانی
        const harmonics = [1, 1.5, 2.02, 2.76];
        const gains = [0.6, 0.25, 0.15, 0.08];

        harmonics.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq * ratio, now);

          oscGain.gain.setValueAtTime(gains[idx], now);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (1 - idx * 0.15));

          osc.connect(oscGain);
          oscGain.connect(root);
          osc.start(now);
          osc.stop(now + duration);
        });
      } catch (e) {
        console.warn('Audio synthesis note:', e);
      }
    }

    /**
     * افکت صوتی باز شدن ورق کهن کتاب (Paper Rustle / Shimmer)
     */
    playPageTurn() {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const dur = 0.55;

        // فیلتر نویز صورتی ملایم شبیه صدای ورق کاغذ
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.12;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + dur);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
      } catch (e) {
        console.warn('Paper sound note:', e);
      }
    }

    /**
     * نوای آشکار شدن کتیبه غزل (Celestial Reveal Chord)
     */
    playRevealChord() {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const chord = [329.63, 440, 554.37, 659.25]; // E major add9
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          gain.gain.setValueAtTime(0.001, now + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 2.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 2.2);
        });
      } catch (e) {
        console.warn('Chord audio note:', e);
      }
    }
  }

  const sound = new SoundEffects();

  // =========================================================================
  // 4. DATA LOADING & MANAGEMENT
  // =========================================================================
  async function loadFaalsDatabase() {
    try {
      const response = await fetch('falnama.json');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        STATE.faals = data;
        STATE.isLoading = false;
        console.log(`[FalGir] ${data.length} ghazals successfully loaded from falnama.json`);
        renderSearchResults();
        return;
      }
      throw new Error('Data array empty or invalid');
    } catch (err) {
      console.warn('[FalGir] falnama.json fetch fallback triggered:', err);
      // استفاده از داده‌های پشتیبان در صورت لزوم (مثلاً اجرای لوکال با پروتکل file://)
      STATE.faals = FALLBACK_FAALS;
      STATE.isLoading = false;
      renderSearchResults();
    }
  }

  // =========================================================================
  // 5. HELPER UTILITIES
  // =========================================================================
  function toPersianDigits(input) {
    if (input === null || input === undefined) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return input.toString().replace(/\d/g, d => farsiDigits[d]);
  }

  function showToast(msg, icon = '✓') {
    if (!DOM.toast) return;
    DOM.toastMsg.textContent = msg;
    DOM.toastIcon.textContent = icon;
    DOM.toast.classList.add('active');
    setTimeout(() => {
      DOM.toast.classList.remove('active');
    }, 3200);
  }

  function getRandomFaalIndex() {
    if (!STATE.faals || STATE.faals.length === 0) return 0;
    return Math.floor(Math.random() * STATE.faals.length);
  }

  function parsePoemLines(poemText) {
    if (!poemText) return [];
    const lines = poemText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const couplets = [];
    for (let i = 0; i < lines.length; i += 2) {
      couplets.push({
        first: lines[i],
        second: lines[i + 1] || ''
      });
    }
    return couplets;
  }

  // =========================================================================
  // 6. MULTI-STAGE DIVINATION ANIMATION (قلب تپنده تجربه فال‌گیر)
  // =========================================================================
  /**
   * توالی انیمیشن چندمرحله‌ای فال:
   * ۱. مرحله نیت و تمرکز (0s - 1.35s): چرخش ذرات نورانی، اوج‌گیری و لرزش سه‌بعدی دیوان حافظ با نوای زنگ عرفانی
   * ۲. مرحله گشایش دیوان (1.35s - 2.1s): باز شدن برگ جلد کتاب با پرسپکتیو سه‌بعدی سنتی و انفجار پرتوهای زرین
   * ۳. مرحله جلوه‌گری غزل (2.1s - 3.1s): ورود کتیبه نسخه خطی تذهیب‌شده و ظهور خط‌به‌خط ابیات با خط نستعلیق
   * ۴. مرحله فرود تعبیر (3.1s - 3.6s): اسلاید آرام کارت تعبیر و ابزارهای اقدام
   * کل توالی: حدود ۳.۳ ثانیه (دقیقاً متناسب با تجربه کاربر و جلوگیری از معطلی)
   */
  function startDivination(targetIndex = null) {
    if (STATE.isDivinating) return;
    STATE.isDivinating = true;

    // انتخاب فال
    const chosenIndex = targetIndex !== null ? targetIndex : getRandomFaalIndex();
    STATE.currentFaalIndex = chosenIndex;
    STATE.currentFaal = STATE.faals[chosenIndex] || STATE.faals[0];

    // غیرفعال کردن دکمه و نمایش وضعیت تفأل
    DOM.btnDivinate.disabled = true;
    DOM.ritualStatus.classList.add('active');
    DOM.ritualMsg.textContent = 'در حال نیت و تفأل به دیوان لسان‌الغیب...';

    // فاز ۱: اوج‌گیری کتاب و نوای کاسه تبتی
    DOM.bookScene.classList.add('is-divinating');
    sound.playSingingBowl(432, 2.5);

    // پاشیدن ذرات نورانی اطراف کتاب
    spawnBurstParticles(DOM.bookScene, 14);

    // فاز ۲ (در ۱.۳۵ ثانیه): گشودن جلد سه‌بعدی کتاب
    setTimeout(() => {
      DOM.ritualMsg.textContent = 'دیوان گشوده شد... راز فال آشکار می‌گردد';
      DOM.bookScene.classList.remove('is-divinating');
      DOM.bookScene.classList.add('is-opening');
      sound.playPageTurn();
    }, 1350);

    // فاز ۳ (در ۲.۱۵ ثانیه): انتقال روان به صفحه نسخه خطی و کتیبه غزل
    setTimeout(() => {
      renderGhazalResult(STATE.currentFaal, STATE.currentFaalIndex);
      DOM.niyyatStage.classList.remove('active');
      DOM.resultStage.classList.add('active');

      sound.playRevealChord();

      // اسکرول نرم به بالای کتیبه
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // پاکسازی کلاس‌های انیمیشن کتاب برای دفعه بعد
      DOM.bookScene.classList.remove('is-opening');
      DOM.ritualStatus.classList.remove('active');
      DOM.btnDivinate.disabled = false;
      STATE.isDivinating = false;
    }, 2150);
  }

  // =========================================================================
  // 7. RESULT RENDERING (Illuminated Manuscript & Couplets)
  // =========================================================================
  function renderGhazalResult(faal, index) {
    if (!faal) return;

    // شماره غزل به فارسی
    const ghazalNumber = index + 1;
    DOM.ghazalTitle.textContent = `غزل شمارهٔ ${toPersianDigits(ghazalNumber)}`;

    // تفکیک ابیات و مصراع‌ها
    const couplets = parsePoemLines(faal.poem);
    DOM.poemContainer.innerHTML = '';

    couplets.forEach((bayt, i) => {
      const baytEl = document.createElement('div');
      baytEl.className = 'bayt';
      // متغیر CSS برای تاخیر متوالی ظهور ابیات
      baytEl.style.setProperty('--bayt-index', i);

      // مصرع اول (راست)
      const mesra1 = document.createElement('span');
      mesra1.className = 'mesra mesra-first';
      mesra1.textContent = bayt.first;

      // نشانگر میانی
      const divider = document.createElement('span');
      divider.className = 'bayt-divider';
      divider.textContent = '✤';
      divider.setAttribute('aria-hidden', 'true');

      // مصرع دوم (چپ)
      const mesra2 = document.createElement('span');
      mesra2.className = 'mesra mesra-second';
      mesra2.textContent = bayt.second;

      baytEl.appendChild(mesra1);
      baytEl.appendChild(divider);
      baytEl.appendChild(mesra2);

      DOM.poemContainer.appendChild(baytEl);
    });

    // نمایش متن تعبیر با فونت مدرن وزیرمتن
    DOM.interpText.textContent = faal.interpretation || 'در این کار نیت خود را با توکل و امیدواری به پیش ببرید.';
  }

  // =========================================================================
  // 8. INTERACTIVE ACTIONS (TRY AGAIN, COPY, SHARE, PRINT)
  // =========================================================================
  /**
   * بازگشت به جلد کتاب و نیت مجدد
   */
  function tryAgain() {
    DOM.resultStage.classList.remove('active');
    DOM.niyyatStage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sound.playSingingBowl(380, 1.2);
  }

  /**
   * کپی متن کامل فال در کلیپ‌بورد
   */
  async function copyFalText() {
    if (!STATE.currentFaal) return;

    const ghazalNum = STATE.currentFaalIndex !== null ? STATE.currentFaalIndex + 1 : '';
    const formattedText = 
`«فال‌گیر - دیوان لسان‌الغیب حافظ شیرازی»
غزل شمارهٔ ${toPersianDigits(ghazalNum)}:

${STATE.currentFaal.poem}

تعبیر فال:
${STATE.currentFaal.interpretation}

✨ تفأل آنلاین در فال‌گیر:
https://ramin-mahmoodi.github.io/FalGir/`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = formattedText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('متن فال و تعبیر با موفقیت کپی شد', '📋');
      sound.playSingingBowl(600, 0.6);
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('خطا در کپی متن!', '⚠️');
    }
  }

  /**
   * اشتراک‌گذاری فال
   */
  async function shareFal() {
    if (!STATE.currentFaal) return;

    const ghazalNum = STATE.currentFaalIndex !== null ? STATE.currentFaalIndex + 1 : '';
    const shareTitle = `فال حافظ - غزل شماره ${toPersianDigits(ghazalNum)}`;
    const couplets = parsePoemLines(STATE.currentFaal.poem);
    const firstBayt = couplets.length > 0 ? `${couplets[0].first} / ${couplets[0].second}` : '';
    const shareText = `فال من از دیوان حافظ:\n«${firstBayt}»\n\nتعبیر: ${STATE.currentFaal.interpretation.slice(0, 120)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        showToast('فال به اشتراک گذاشته شد', '✨');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyFalText();
        }
      }
    } else {
      copyFalText();
    }
  }

  // =========================================================================
  // 9. MODALS & SEARCH MANAGEMENT
  // =========================================================================
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderSearchResults(filter = '') {
    if (!DOM.searchResultsList) return;
    DOM.searchResultsList.innerHTML = '';

    const query = filter.trim().toLowerCase();
    let matches = [];

    STATE.faals.forEach((item, idx) => {
      const couplets = parsePoemLines(item.poem);
      const firstLine = couplets.length > 0 ? couplets[0].first : '';
      if (!query || item.poem.toLowerCase().includes(query) || (idx + 1).toString().includes(query)) {
        matches.push({ index: idx, firstLine });
      }
    });

    const displayMatches = matches.slice(0, 30); // نمایش ۳۰ مورد برتر

    if (displayMatches.length === 0) {
      DOM.searchResultsList.innerHTML = '<div style="padding: 1rem; color: #8c9ebf; text-align: center;">موردی یافت نشد.</div>';
      return;
    }

    displayMatches.forEach(item => {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.innerHTML = `
        <span class="item-ghazal-first-line">${item.firstLine}</span>
        <span class="item-ghazal-num">غزل ${toPersianDigits(item.index + 1)}</span>
      `;
      row.addEventListener('click', () => {
        closeModal(DOM.searchModal);
        startDivination(item.index);
      });
      DOM.searchResultsList.appendChild(row);
    });
  }

  // =========================================================================
  // 10. VISUAL PARTICLES
  // =========================================================================
  function initAmbientParticles() {
    if (!DOM.particlesContainer) return;
    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDuration = `${5 + Math.random() * 6}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      p.style.transform = `scale(${0.4 + Math.random() * 0.7})`;
      DOM.particlesContainer.appendChild(p);
    }
  }

  function spawnBurstParticles(container, count = 10) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.style.position = 'absolute';
      spark.style.top = '50%';
      spark.style.left = '50%';
      spark.style.width = '6px';
      spark.style.height = '6px';
      spark.style.borderRadius = '50%';
      spark.style.backgroundColor = '#fff2c6';
      spark.style.boxShadow = '0 0 10px #d4af37';
      spark.style.pointerEvents = 'none';
      spark.style.zIndex = '30';
      spark.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.2, 1)';

      container.appendChild(spark);

      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance;

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        if (spark.parentNode) spark.parentNode.removeChild(spark);
      }, 1100);
    }
  }

  // =========================================================================
  // 11. EVENT LISTENERS
  // =========================================================================
  function setupEvents() {
    // کلیک روی دکمه گرفتن فال یا جلد کتاب سه‌بعدی
    DOM.btnDivinate.addEventListener('click', () => startDivination());
    DOM.book3D.addEventListener('click', () => {
      if (DOM.niyyatStage.classList.contains('active')) {
        startDivination();
      }
    });

    // دکمه‌های صفحه نتایج
    DOM.btnTryAgain.addEventListener('click', tryAgain);
    DOM.btnCopyFal.addEventListener('click', copyFalText);
    DOM.btnShareFal.addEventListener('click', shareFal);
    DOM.btnPrintFal.addEventListener('click', () => window.print());

    // دکمه صدا
    DOM.btnSoundToggle.addEventListener('click', () => sound.toggle());

    // مودال جستجو
    DOM.btnSearchModal.addEventListener('click', () => {
      openModal(DOM.searchModal);
      if (DOM.ghazalNumberInput) DOM.ghazalNumberInput.focus();
    });
    DOM.btnCloseSearchModal.addEventListener('click', () => closeModal(DOM.searchModal));
    DOM.searchModal.addEventListener('click', (e) => {
      if (e.target === DOM.searchModal) closeModal(DOM.searchModal);
    });

    DOM.btnJumpToNumber.addEventListener('click', () => {
      const num = parseInt(DOM.ghazalNumberInput.value, 10);
      if (num >= 1 && num <= STATE.faals.length) {
        closeModal(DOM.searchModal);
        startDivination(num - 1);
      } else {
        showToast(`لطفاً عددی بین ۱ تا ${toPersianDigits(STATE.faals.length)} وارد کنید`, '⚠️');
      }
    });

    DOM.ghazalSearchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    // مودال آداب فال
    DOM.btnAboutModal.addEventListener('click', () => openModal(DOM.aboutModal));
    DOM.btnCloseAboutModal.addEventListener('click', () => closeModal(DOM.aboutModal));
    DOM.aboutModal.addEventListener('click', (e) => {
      if (e.target === DOM.aboutModal) closeModal(DOM.aboutModal);
    });

    // کلیدهای میانبر کیبورد
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(DOM.searchModal);
        closeModal(DOM.aboutModal);
      } else if ((e.key === ' ' || e.key === 'Enter') && DOM.niyyatStage.classList.contains('active')) {
        // جلوگیری از اسکرول صفحه با کلید Space
        if (document.activeElement.tagName !== 'INPUT' && !STATE.isDivinating) {
          e.preventDefault();
          startDivination();
        }
      }
    });
  }

  // =========================================================================
  // 12. INITIALIZATION
  // =========================================================================
  function init() {
    loadFaalsDatabase();
    initAmbientParticles();
    setupEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
