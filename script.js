/**
 * FalGir - فال‌گیر | سامانه تفأل به دیوان حافظ شیرازی
 * High-Performance Vanilla JavaScript
 * - Pure SVG Icons (No Emojis)
 * - Hardware Accelerated 3D Book Divination
 * - Lightweight Audio Synthesizer (Web Audio API)
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
    searchCache: null, // کش برای جستجوی تنبل (Lazy search)
  };

  // SVG Icons for dynamic insertion
  const SVG_ICONS = {
    soundOn: `
      <svg class="svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>`,
    soundOff: `
      <svg class="svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>`,
    check: `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`,
    alert: `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`,
    moon: `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`,
    sun: `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`
  };

  // داده‌های فال‌بک برای محیط‌های بدون وب‌سرور (مانند اجرای محلی file://)
  const FALLBACK_FAALS = [
    {
      poem: "الا یا ایها الساقی ادر کأسا و ناولها\r\nکه عشق آسان نمود اول ولی افتاد مشکل‌ها\r\nبه بوی نافه‌ای کاخر صبا زان طره بگشاید\r\nز تاب جعد مشکینش چه خون افتاد در دل‌ها\r\nمرا در منزل جانان چه امن عیش چون هر دم\r\nجرس فریاد می‌دارد که بربندید محمل‌ها\r\nبه می سجاده رنگین کن گرت پیر مغان گوید\r\nکه سالک بی‌خبر نبود ز راه و رسم منزل‌ها\r\nشب تاریک و بیم موج و گردابی چنین هایل\r\nکجا دانند حال ما سبکباران ساحل‌ها\r\nهمه کارم ز خود کامی به بدنامی کشید آخر\r\nنهان کی ماند آن رازی کز او سازند محفل‌ها\r\nحضوری گر همی‌خواهی از او غایب مشو حافظ\r\nمتی ما تلق من تهوی دع الدنیا و اهملها",
      interpretation: "مشکلاتتان به‌زودی حل خواهد شد و شما به نیت خودتان خواهید رسید. بعد از تاریکی و غم، روشنایی در انتظار شماست. به تدبیر و تجربه تکیه کنید و امیدوار باشید."
    },
    {
      poem: "صلاح کار کجا و من خراب کجا\r\nببین تفاوت ره کز کجاست تا به کجا\r\nدلم ز صومعه بگرفت و خرقه سالوس\r\nکجاست دیر مغان و شراب ناب کجا\r\nچه نسبت است به رندی صلاح و تقوا را\r\nسماع وعظ کجا نغمه رباب کجا\r\nز روی دوست دل دشمنان چه دریابد\r\nچراغ مرده کجا شمع آفتاب کجا\r\nچو کحل بینش ما خاک آستان شماست\r\nکجا رویم بفرما از این جناب کجا\r\nمبین به سیب زنخدان که چاه در راه است\r\nکجا همی‌روی ای دل بدین شتاب کجا\r\nبشد که یاد خوشش باد روزگار وصال\r\nخود آن کرشمه کجا رفت و آن عتاب کجا\r\nقرار و خواب ز حافظ طمع مدار ای دوست\r\nقرار چیست صبوری کدام و خواب کجا",
      interpretation: "در تصمیم‌گیری شتاب نکنید و عاقبت‌اندیش باشید. راهی که برگزیده‌اید نیاز به دقت و درایت دارد. از دورویی پرهیز کنید و بر عهد و پیمان خود استوار بمانید."
    },
    {
      poem: "صحن بستان ذوق بخش و صحبت یاران خوش است\r\nوقت گل خوش باد کز وی وقت میخواران خوش است\r\nاز صبا هر دم مشام جان ما خوش می‌شود\r\nآری آری طیب انفاس هواداران خوش است\r\nناگشوده گل نقاب آهنگ رحلت ساز کرد\r\nناله کن بلبل که گلبانگ دل افکاران خوش است\r\nمرغ خوشخوان را بشارت باد کاندر باغ شاه\r\nفر بلبل با نگارین کبک و باز آراسته است\r\nحافظا چون غم و شادی جهان در گذر است\r\nبهتر آن است که من خاطر خود خوش دارم",
      interpretation: "خبرهای خوشی در راه است و روزهای شادمانی فرا می‌رسد. قدر همنشینان نیک و لحظات عمر را بدانید و از وسواس‌های بیهوده دوری گزینید."
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
    
    // Revealed Page inside 3D Book
    bookRevealedTitle: document.getElementById('bookRevealedTitle'),
    bookRevealedBody: document.getElementById('bookRevealedBody'),
    
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
    soundIconWrap: document.getElementById('soundIconWrap'),
    
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
    
    // Toast
    toast: document.getElementById('toastNotification'),
    toastMsg: document.getElementById('toastMsg'),
    toastIconWrap: document.getElementById('toastIconWrap'),
  };

  // =========================================================================
  // 3. SOUND SYNTHESIZER (Pure Web Audio API - Lightweight)
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
        this.playSingingBowl(528, 0.3);
      }
    }

    updateUI() {
      if (DOM.soundIconWrap) {
        DOM.soundIconWrap.innerHTML = STATE.soundEnabled ? SVG_ICONS.soundOn : SVG_ICONS.soundOff;
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

    playSingingBowl(freq = 432, duration = 1.8) {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Audio policy ignore
      }
    }

    playPageTurn() {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const dur = 0.35;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.05;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + dur);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + dur);
      } catch (e) {
        // Audio policy ignore
      }
    }

    playRevealChord() {
      if (!STATE.soundEnabled) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [440, 554.37, 659.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.05 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 1.4);
        });
      } catch (e) {
        // Audio policy ignore
      }
    }
  }

  const sound = new SoundEffects();

  // =========================================================================
  // 4. DATA LOADING
  // =========================================================================
  async function loadFaalsDatabase() {
    try {
      const response = await fetch('falnama.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        STATE.faals = data;
        STATE.isLoading = false;
        return;
      }
      throw new Error('Data empty');
    } catch (err) {
      console.warn('[FalGir] falnama.json fetch fallback:', err);
      STATE.faals = FALLBACK_FAALS;
      STATE.isLoading = false;
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

  function showToast(msg, iconType = 'check') {
    if (!DOM.toast) return;
    DOM.toastMsg.textContent = msg;
    DOM.toastIconWrap.innerHTML = iconType === 'check' ? SVG_ICONS.check : SVG_ICONS.alert;
    DOM.toast.classList.add('active');
    setTimeout(() => {
      DOM.toast.classList.remove('active');
    }, 2800);
  }

  function getRandomFaalIndex() {
    if (!STATE.faals || STATE.faals.length === 0) return 0;
    return Math.floor(Math.random() * STATE.faals.length);
  }

  function parsePoemLines(poemText) {
    if (!poemText) return [];
    const lines = poemText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const couplets = [];
    for (let i = 0; i < lines.length; i += 2) {
      couplets.push({
        first: lines[i],
        second: lines[i + 1] || ''
      });
    }
    return couplets;
  }

  // بروزرسانی برگه‌های متحرک و همچنین صفحه ثابت زیرین کتاب با غزل نهایی
  function populateFlippingLeaves(finalIndex) {
    if (!STATE.faals || STATE.faals.length === 0) return;
    const total = STATE.faals.length;

    // ۱. صفحه ثابت زیرین (که در انتهای ورق‌زدن در سمت راست نمایان می‌شود): غزل نهایی فال
    const chosenFaal = STATE.faals[finalIndex] || STATE.faals[0];
    if (DOM.bookRevealedTitle) {
      DOM.bookRevealedTitle.textContent = `غزل ${toPersianDigits(finalIndex + 1)}`;
    }
    if (DOM.bookRevealedBody && chosenFaal) {
      const chosenLines = chosenFaal.poem
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .slice(0, 4);
      DOM.bookRevealedBody.innerHTML = chosenLines
        .map(line => `<p class="leaf-verse">${line}</p>`)
        .join('');
    }

    // ۲. برگه‌های متحرک ورق‌زن (۵ برگ): شماره‌گذاری دقیق و متوالی طبق واقعیت کتاب
    //    برگ آخر (برگ ۴):
    //      - پشت برگ (leaf-back): غزل ۱-N (در سمت چپ روبروی غزل نهایی باز می‌ماند)
    //      - روی برگ (leaf-front): غزل ۲-N (قبل از آخرین ورق‌خوردن در سمت راست دیده می‌شود)
    //    برگ‌های قبلی نیز به ترتیب منظم از قبل تا غزل فال چیده می‌شوند تا هیچ پرش یا تفاوت شماره‌ای رخ ندهد.
    const leaves = document.querySelectorAll('#bookPageStack .leaf');
    if (!leaves || leaves.length === 0) return;

    const leafCount = leaves.length; // ۵ برگ
    leaves.forEach((leaf, leafIdx) => {
      // فاصله از برگ آخر (برای برگ ۴ مقدار ۰، برای برگ ۳ مقدار ۱، ...)
      const offsetFromEnd = (leafCount - 1) - leafIdx;

      // شماره پشت برگ (verso) که بعد از ورق خوردن به سمت چپ می‌افتد
      const backIdx = (finalIndex - (offsetFromEnd * 2 + 1) + total * 20) % total;
      // شماره روی برگ (recto) که قبل از ورق خوردن در سمت راست است
      const frontIdx = (finalIndex - (offsetFromEnd * 2 + 2) + total * 20) % total;

      const frontFace = leaf.querySelector('.leaf-front');
      const backFace = leaf.querySelector('.leaf-back');

      // تنظیم وجه رویی برگ
      if (frontFace) {
        const faalFront = STATE.faals[frontIdx] || STATE.faals[0];
        const hFront = frontFace.querySelector('.leaf-header');
        if (hFront) hFront.textContent = `غزل ${toPersianDigits(frontIdx + 1)}`;
        const bFront = frontFace.querySelector('.leaf-body');
        if (bFront && faalFront) {
          const lines = faalFront.poem
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .slice(0, 4);
          bFront.innerHTML = lines.map(line => `<p class="leaf-verse">${line}</p>`).join('');
        }
      }

      // تنظیم وجه پشتی برگ
      if (backFace) {
        const faalBack = STATE.faals[backIdx] || STATE.faals[0];
        const hBack = backFace.querySelector('.leaf-header');
        if (hBack) hBack.textContent = `غزل ${toPersianDigits(backIdx + 1)}`;
        const bBack = backFace.querySelector('.leaf-body');
        if (bBack && faalBack) {
          const lines = faalBack.poem
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .slice(0, 4);
          bBack.innerHTML = lines.map(line => `<p class="leaf-verse">${line}</p>`).join('');
        }
      }
    });
  }

  // =========================================================================
  // 6. HIGH-PERFORMANCE 3D DIVINATION SEQUENCE
  // =========================================================================
  function startDivination(targetIndex = null) {
    if (STATE.isDivinating) return;
    STATE.isDivinating = true;

    // انتخاب فال
    const chosenIndex = targetIndex !== null ? targetIndex : getRandomFaalIndex();
    STATE.currentFaalIndex = chosenIndex;
    STATE.currentFaal = STATE.faals[chosenIndex] || STATE.faals[0];

    // پر کردن برگه‌های ورق‌زن با ابیات و شماره غزل‌های واقعی دیوان
    populateFlippingLeaves(chosenIndex);

    // وضعیت UI
    DOM.btnDivinate.disabled = true;

    // فاز ۱: اوج‌گیری دیوان و نوای کاسه تبتی
    DOM.bookScene.classList.add('is-divinating');
    sound.playSingingBowl(432, 2.0);

    // فاز ۲: جلد کتاب ۱۸۰ درجه باز میشود و برگها یکی پس از دیگری کامل ورق میخورند
    setTimeout(() => {
      DOM.bookScene.classList.remove('is-divinating');
      DOM.bookScene.classList.add('is-opening');

      // صدای باز شدن جلد و سپس صدای ورق خوردن هر برگ
      sound.playPageTurn();
      [550, 720, 890, 1060, 1230].forEach(delay => {
        setTimeout(() => sound.playPageTurn(), delay);
      });
    }, 450);

    // فاز ۳: ورود به کتیبه غزل (پس از پایان کامل تورق: ۴۵۰ + ۲۴۰۰ میلیثانیه)
    setTimeout(() => {
      renderGhazalResult(STATE.currentFaal, STATE.currentFaalIndex);
      DOM.niyyatStage.classList.remove('active');
      DOM.resultStage.classList.add('active');

      sound.playRevealChord();

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // ریست کلاس‌ها
      DOM.bookScene.classList.remove('is-opening');
      DOM.btnDivinate.disabled = false;
      STATE.isDivinating = false;
    }, 2850);
  }

  // =========================================================================
  // 7. RESULT RENDERING (NASTALIQ & COUPLETS)
  // =========================================================================
  function renderGhazalResult(faal, index) {
    if (!faal) return;

    const ghazalNumber = index + 1;
    DOM.ghazalTitle.textContent = `غزل شماره ${toPersianDigits(ghazalNumber)}`;

    const couplets = parsePoemLines(faal.poem);
    DOM.poemContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    couplets.forEach((bayt, i) => {
      const baytEl = document.createElement('div');
      baytEl.className = 'bayt';
      baytEl.style.setProperty('--bayt-index', i);

      const mesra1 = document.createElement('span');
      mesra1.className = 'mesra mesra-first';
      mesra1.textContent = bayt.first;

      const divider = document.createElement('span');
      divider.className = 'bayt-divider';
      divider.innerHTML = '<svg class="bayt-ornament-svg" viewBox="0 0 16 16" width="6" height="6" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="3.5"></circle></svg>';
      divider.setAttribute('aria-hidden', 'true');

      const mesra2 = document.createElement('span');
      mesra2.className = 'mesra mesra-second';
      mesra2.textContent = bayt.second;

      baytEl.appendChild(mesra1);
      baytEl.appendChild(divider);
      baytEl.appendChild(mesra2);

      fragment.appendChild(baytEl);
    });

    DOM.poemContainer.appendChild(fragment);

    // متن تعبیر
    DOM.interpText.textContent = faal.interpretation || 'در این کار نیت خود را با درایت و امیدواری به پیش ببرید.';
  }

  // =========================================================================
  // 8. ACTIONS (TRY AGAIN, COPY, SHARE)
  // =========================================================================
  function tryAgain() {
    DOM.resultStage.classList.remove('active');
    DOM.niyyatStage.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    sound.playSingingBowl(380, 0.8);
  }

  async function copyFalText() {
    if (!STATE.currentFaal) return;

    const ghazalNum = STATE.currentFaalIndex !== null ? STATE.currentFaalIndex + 1 : '';
    const formattedText = 
`«فال‌گیر - دیوان حافظ شیرازی»
غزل شماره ${toPersianDigits(ghazalNum)}:

${STATE.currentFaal.poem}

تعبیر فال:
${STATE.currentFaal.interpretation}

تفأل آنلاین در فال‌گیر:
https://ramin-mahmoodi.github.io/FalGir/`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formattedText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('متن فال و تعبیر با موفقیت کپی شد', 'check');
      sound.playSingingBowl(580, 0.4);
    } catch (err) {
      showToast('خطا در کپی متن!', 'alert');
    }
  }

  async function shareFal() {
    if (!STATE.currentFaal) return;

    const ghazalNum = STATE.currentFaalIndex !== null ? STATE.currentFaalIndex + 1 : '';
    const shareTitle = `فال حافظ - غزل شماره ${toPersianDigits(ghazalNum)}`;
    const couplets = parsePoemLines(STATE.currentFaal.poem);
    const firstBayt = couplets.length > 0 ? `${couplets[0].first} / ${couplets[0].second}` : '';
    const shareText = `فال حافظ:\n«${firstBayt}»\n\nتعبیر: ${STATE.currentFaal.interpretation.slice(0, 100)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        showToast('فال به اشتراک گذاشته شد', 'check');
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
  // 9. LAZY & DEBOUNCED SEARCH
  // =========================================================================
  function getSearchCache() {
    if (!STATE.searchCache && STATE.faals.length > 0) {
      STATE.searchCache = STATE.faals.map((item, idx) => {
        const firstLine = item.poem.split('\r\n')[0] || '';
        return {
          index: idx,
          firstLine: firstLine.trim(),
          fullTextLower: item.poem.toLowerCase()
        };
      });
    }
    return STATE.searchCache || [];
  }

  function renderSearchResults(filter = '') {
    if (!DOM.searchResultsList) return;
    DOM.searchResultsList.innerHTML = '';

    const query = filter.trim().toLowerCase();
    const cache = getSearchCache();
    let matches = [];

    for (let i = 0; i < cache.length; i++) {
      const item = cache[i];
      if (!query || (item.index + 1).toString() === query || item.fullTextLower.includes(query)) {
        matches.push(item);
        if (matches.length >= 25) break; // حداکثر ۲۵ مورد برای سرعت فوق‌العاده
      }
    }

    if (matches.length === 0) {
      DOM.searchResultsList.innerHTML = '<div style="padding: 0.8rem; color: #8c9ebf; text-align: center; font-size: 0.88rem;">موردی یافت نشد.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(item => {
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
      fragment.appendChild(row);
    });

    DOM.searchResultsList.appendChild(fragment);
  }

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

  // =========================================================================
  // 10. EVENT LISTENERS
  // =========================================================================
  function setupEvents() {
    // شروع تفأل با دکمه یا کتاب سه‌بعدی
    DOM.btnDivinate.addEventListener('click', () => startDivination());
    DOM.book3D.addEventListener('click', () => {
      if (DOM.niyyatStage.classList.contains('active')) {
        startDivination();
      }
    });

    // دکمه‌های صفحه نتایج
    DOM.btnTryAgain.addEventListener('click', tryAgain);
    const btnBannerTryAgain = document.getElementById('btnBannerTryAgain');
    if (btnBannerTryAgain) {
      btnBannerTryAgain.addEventListener('click', tryAgain);
    }
    DOM.btnCopyFal.addEventListener('click', copyFalText);
    DOM.btnShareFal.addEventListener('click', shareFal);
    DOM.btnPrintFal.addEventListener('click', () => window.print());


    // دکمه صدا
    DOM.btnSoundToggle.addEventListener('click', () => sound.toggle());

    // دکمه حالت عرفانی (Dream Mode)
    const btnDream = document.getElementById('dreamToggle');
    const dreamIconWrap = document.getElementById('dreamIconWrap');
    if (btnDream) {
      btnDream.addEventListener('click', () => {
        const isDream = document.body.classList.toggle('dream-mode');
        btnDream.setAttribute('aria-pressed', isDream.toString());
        const textSpan = btnDream.querySelector('.nav-btn-text') || btnDream.querySelector('span:last-child');
        if (textSpan) {
          textSpan.textContent = isDream ? 'حالت عرفانی: روشن' : 'حالت عرفانی: خاموش';
        }
        btnDream.title = isDream ? 'حالت عرفانی: روشن (فعال)' : 'حالت عرفانی: خاموش';
        if (dreamIconWrap) {
          dreamIconWrap.innerHTML = isDream ? SVG_ICONS.sun : SVG_ICONS.moon;
        }
        sound.playSingingBowl(isDream ? 528 : 432, 0.6);
      });
    }

    // دکمه بازگشت به بالا (Scroll to Top)
    const btnScrollTop = document.getElementById('btnScrollTop');
    if (btnScrollTop) {
      btnScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // مودال جستجو
    DOM.btnSearchModal.addEventListener('click', () => {
      openModal(DOM.searchModal);
      renderSearchResults('');
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
        showToast(`لطفاً عددی بین ۱ تا ${toPersianDigits(STATE.faals.length)} وارد کنید`, 'alert');
      }
    });

    // دی‌بانس ورودی جستجو
    let searchTimeout = null;
    DOM.ghazalSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderSearchResults(e.target.value);
      }, 120);
    });

    // مودال آداب
    DOM.btnAboutModal.addEventListener('click', () => openModal(DOM.aboutModal));
    DOM.btnCloseAboutModal.addEventListener('click', () => closeModal(DOM.aboutModal));
    DOM.aboutModal.addEventListener('click', (e) => {
      if (e.target === DOM.aboutModal) closeModal(DOM.aboutModal);
    });

    // دکمه‌های کمکی فوتر
    const btnFooterSearch = document.getElementById('btnFooterSearch');
    if (btnFooterSearch) {
      btnFooterSearch.addEventListener('click', () => {
        openModal(DOM.searchModal);
        renderSearchResults('');
        if (DOM.ghazalNumberInput) DOM.ghazalNumberInput.focus();
      });
    }

    const btnFooterAdab = document.getElementById('btnFooterAdab');
    if (btnFooterAdab) {
      btnFooterAdab.addEventListener('click', () => openModal(DOM.aboutModal));
    }

    // کلیدهای میانبر
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(DOM.searchModal);
        closeModal(DOM.aboutModal);
      } else if ((e.key === ' ' || e.key === 'Enter') && DOM.niyyatStage.classList.contains('active')) {
        if (document.activeElement.tagName !== 'INPUT' && !STATE.isDivinating) {
          e.preventDefault();
          startDivination();
        }
      }
    });
  }

  // =========================================================================
  // 11. INITIALIZATION
  // =========================================================================
  function init() {
    loadFaalsDatabase();
    setupEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
