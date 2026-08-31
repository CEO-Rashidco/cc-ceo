/* ==========================================================================
   MOHAMMAD RASHID — MAIN INTERACTIVE LOGIC
   ========================================================================== */

let audioEnabled = false;
let audioCtx = null;

function toggleAudioFeedback() {
    audioEnabled = !audioEnabled;
    const btnIcon = document.getElementById('audio-icon');
    if (audioEnabled) {
        btnIcon.className = 'fas fa-volume-up';
        showToast(lang === 'ar' ? 'تم تفعيل المؤثرات الصوتية التفاعلية 🔊' : 'Audio Feedback Enabled 🔊');
        playSynthBeep(600, 0.08);
    } else {
        btnIcon.className = 'fas fa-volume-mute';
        showToast(lang === 'ar' ? 'تم إيقاف الصوت 🔇' : 'Audio Feedback Disabled 🔇');
    }
}

function playSynthBeep(freq = 440, duration = 0.05) {
    if (!audioEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e){}
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, a, .tool-tag, .service-card, .cert-card, .honor-card').forEach(el => {
        el.addEventListener('mouseenter', () => playSynthBeep(520, 0.03));
        el.addEventListener('click', () => playSynthBeep(780, 0.06));
    });
});

/* Intro Loader */
(function() {
    const roles = [
        'صاحب أعمال وشريك استراتيجي',
        'بناء نماذج الأعمال والشراكات',
        'مُكرم من وزير البيئة و GIZ وسفير الاتحاد الأوروبي',
        'مرشح ماجستير ذكاء الأعمال (MSc in BI)',
        'رئيس قسم التسويق والدعاية'
    ];

    const roleEl   = document.getElementById('intro-role');
    const fillEl   = document.getElementById('intro-fill');
    const pctEl    = document.getElementById('intro-pct');
    const screen   = document.getElementById('intro-screen');

    if (!roleEl || !screen) return;

    let roleIdx = 0, charIdx = 0, typing = true;
    let pct = 0;
    let introDone = false;

    function typeNext() {
        if (introDone) return;
        const current = roles[roleIdx];
        const cursor  = '<span class="intro-cursor-blink"></span>';

        if (typing) {
            charIdx++;
            roleEl.innerHTML = current.slice(0, charIdx) + cursor;
            if (charIdx < current.length) {
                setTimeout(typeNext, 55);
            } else {
                setTimeout(() => { typing = false; typeNext(); }, 900);
            }
        } else {
            charIdx--;
            roleEl.innerHTML = current.slice(0, charIdx) + cursor;
            if (charIdx > 0) {
                setTimeout(typeNext, 30);
            } else {
                roleIdx = (roleIdx + 1) % roles.length;
                typing  = true;
                setTimeout(typeNext, 250);
            }
        }
    }

    function tick() {
        if (introDone) return;
        const increment = pct < 40 ? 1.8 : pct < 85 ? 1.1 : 1.6;
        pct = Math.min(pct + increment, 100);
        fillEl.style.width = pct + '%';
        pctEl.textContent  = Math.round(pct) + '%';

        if (pct < 100) {
            setTimeout(tick, 28);
        } else {
            setTimeout(exitIntro, 350);
        }
    }

    function exitIntro() {
        if (introDone) return;
        introDone = true;
        screen.classList.add('hide');
        document.getElementById('body').classList.remove('intro-active');
        setTimeout(() => { screen.style.display = 'none'; }, 1050);
    }

    window.skipIntro = exitIntro;
    setTimeout(typeNext, 700);
    setTimeout(tick, 1000);
})();

/* Canvas Particle Mesh */
(function() {
    const canvas = document.getElementById('canvas-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#d4af37';
            ctx.globalAlpha = 0.35;
            ctx.fill();
        }
    }

    for (let i = 0; i < 40; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = '#d4af37';
                    ctx.globalAlpha = (1 - dist / 120) * 0.15;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

/* Custom Cursor & Tilt */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => { 
    mx=e.clientX; my=e.clientY; 
    if(cursor) { cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }
});
setInterval(() => { 
    if(ring) {
        rx += (mx-rx)*0.14; ry += (my-ry)*0.14; 
        ring.style.left=rx+'px'; ring.style.top=ry+'px'; 
    }
}, 16);

document.querySelectorAll('a, button, .service-card, .gallery-item, .cert-card, .honor-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('active'));
});

// 3D Tilt Effect on Hero Card
const tiltCard = document.getElementById('tilt-card');
if (tiltCard) {
    tiltCard.addEventListener('mousemove', e => {
        const rect = tiltCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const imgCard = tiltCard.querySelector('.hero-img-card');
        if (imgCard) imgCard.style.transform = `rotateY(${x * 0.03}deg) rotateX(${-y * 0.03}deg)`;
    });
    tiltCard.addEventListener('mouseleave', () => {
        const imgCard = tiltCard.querySelector('.hero-img-card');
        if (imgCard) imgCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
}

/* Header & Progress Bar */
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;
    const progressEl = document.getElementById('scroll-progress');
    if (progressEl) progressEl.style.width = progress + '%';

    const header = document.getElementById('header');
    if (header) header.classList.toggle('scrolled', scrollY > 40);

    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) scrollTop.classList.toggle('show', scrollY > 400);

    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
});

/* Intersection Observers */
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal, .timeline-item').forEach(el => revealObs.observe(el));

const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if(e.isIntersecting){
            e.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, { threshold: 0.25 });
document.querySelectorAll('.skill-group').forEach(g => skillObs.observe(g));

function animateCounter(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if(progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if(e.isIntersecting){
            e.target.querySelectorAll('[data-target]').forEach(animateCounter);
            counterObs.unobserve(e.target);
        }
    });
}, { threshold: 0.4 });
document.querySelectorAll('.stats-bar, .highlight-section').forEach(s => counterObs.observe(s));

/* Skills Filtering */
function filterSkills(category, btnEl) {
    document.querySelectorAll('.skills-filter .filter-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    const items = document.querySelectorAll('.skill-item');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(`skill-cat-${category}`)) {
            item.style.display = 'block';
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => { item.style.display = 'none'; }, 300);
        }
    });
}

/* Interactive Strategy & ROI Calculator */
function updateCalculator() {
    const budgetEl = document.getElementById('slider-budget');
    const monthsEl = document.getElementById('slider-months');
    const strategyEl = document.getElementById('select-strategy');

    if (!budgetEl || !monthsEl || !strategyEl) return;

    const budget = +budgetEl.value;
    const months = +monthsEl.value;
    const strategy = strategyEl.value;

    document.getElementById('val-budget').textContent = '$' + budget.toLocaleString();
    document.getElementById('val-months').textContent = months + (lang === 'ar' ? ' أشهر' : ' Months');

    let roiBase = 240;
    let reachMultiplier = 95;
    let cpaReduction = 35;

    if (strategy === 'bi') { roiBase = 320; reachMultiplier = 65; cpaReduction = 42; }
    else if (strategy === 'crm') { roiBase = 300; reachMultiplier = 80; cpaReduction = 48; }
    else if (strategy === 'training') { roiBase = 260; reachMultiplier = 45; cpaReduction = 30; }

    const roi = Math.round(roiBase + (budget / 2000) * 8 + (months * 4));
    const reach = Math.round((budget * reachMultiplier * (months / 4)) / 1000);
    const cpa = Math.min(60, Math.round(cpaReduction + (months * 0.8)));

    document.getElementById('res-roi').textContent = '+' + roi + '%';
    document.getElementById('res-reach').textContent = (reach > 1000 ? (reach/1000).toFixed(1) + 'M+' : reach + 'K+');
    document.getElementById('res-eff').textContent = '-' + cpa + '%';
}

/* Testimonials Carousel */
let currentTest = 1;
function showTestimonial(idx) {
    document.querySelectorAll('.testimonial-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.test-dot').forEach(d => d.classList.remove('active'));
    
    const card = document.getElementById(`test-${idx}`);
    if (card) card.classList.add('active');
    const dots = document.querySelectorAll('.test-dot');
    if (dots[idx - 1]) dots[idx - 1].classList.add('active');
    currentTest = idx;
}
setInterval(() => {
    currentTest = (currentTest % 3) + 1;
    showTestimonial(currentTest);
}, 6500);

/* Modals & Lightbox */
function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}

function openConsultModal() {
    document.getElementById('consult-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeConsultModal() {
    document.getElementById('consult-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function handleConsultSubmit(e) {
    e.preventDefault();
    const service = document.getElementById('consult-service').value;
    const name = document.getElementById('consult-name').value;
    const notes = document.getElementById('consult-notes').value;

    const message = encodeURIComponent(`مرحباً أستاذ محمد راشد،\nأنا: ${name}\nأرغب في بحث فرصة شراكة استراتيجية / مشاريع في: ${service}\nالتفاصيل: ${notes}`);
    window.open(`https://wa.me/962777935564?text=${message}`, '_blank');
    closeConsultModal();
    showToast(lang === 'ar' ? 'جاري توجيهك إلى واتساب مباشرة...' : 'Redirecting to WhatsApp...');
}

/* Case Studies Data */
const caseStudies = {
    alameen: {
        ar: {
            title: 'شركة الأمين للصناعات الغذائية — بناء المنظومة التسويقية والنمو',
            sub: 'إدارة العلامة التجارية والتحول الرقمي وحملات ROI العالية',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">التحدي والرؤية:</h4>
                <p style="margin-bottom:15px; color:var(--slate-light);">تطوير وتوسيع الحصة السوقية لشركة الأمين عبر الجمع بين التسويق الرقمي الحديث، تحسين محركات البحث SEO، وأتمتة تحليل البيانات.</p>
                <h4 style="color:var(--gold); margin-bottom:8px;">النهج الاستراتيجي:</h4>
                <ul style="margin-bottom:15px; padding-right:20px; color:var(--slate-light);">
                    <li>بناء مسارات تسويقية متكاملة (Meta & Google Ads) بنسب استهداف دقيقة.</li>
                    <li>إنشاء dashboards تفاعلية بـ Power BI لتتبع أداء الحملات والمبيعات لحظياً.</li>
                    <li>صياغة الهوية المؤسسية الشاملة وتصدّر محركات البحث.</li>
                </ul>
                <h4 style="color:var(--cyan); margin-bottom:8px;">النتائج المحققة:</h4>
                <p style="color:var(--white); font-weight:700;">ارتفاع ملموس في نمو المبيعات وتصدر العلامة التجارية في النتائج البحثية الرقمية.</p>
            `
        },
        en: {
            title: 'Al-Ameen Food Industries — Marketing & Growth Ecosystem',
            sub: 'Brand Strategy, Digital Transformation & High-ROI Campaigns',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">Challenge & Vision:</h4>
                <p style="margin-bottom:15px; color:var(--slate-light);">Expanding market share by integrating modern digital marketing, SEO dominance, and automated data analytics.</p>
                <h4 style="color:var(--gold); margin-bottom:8px;">Strategic Approach:</h4>
                <ul style="margin-left:20px; margin-bottom:15px; color:var(--slate-light);">
                    <li>Building integrated conversion funnels (Meta & Google Ads).</li>
                    <li>Creating dynamic Power BI dashboards for real-time sales tracking.</li>
                    <li>Establishing complete corporate identity and search dominance.</li>
                </ul>
                <h4 style="color:var(--cyan); margin-bottom:8px;">Key Results:</h4>
                <p style="color:var(--white); font-weight:700;">Substantial sales growth and market leadership across digital search engines.</p>
            `
        }
    },
    ahlni: {
        ar: {
            title: 'مشروع "أهلني" — تمكين الشباب الأردني والجاهزية لسوق العمل',
            sub: 'بالشراكة والتعاون مع منظمة Blumont International',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">فكرة المبادرة:</h4>
                <p style="margin-bottom:15px; color:var(--slate-light);">سد الفجوة بين المخرجات الأكاديمية ومتطلبات شركات القطاع الخاص عبر تدريب عملي مكثف.</p>
                <h4 style="color:var(--gold); margin-bottom:8px;">الإنجازات بالأرقام:</h4>
                <ul style="margin-bottom:15px; padding-right:20px; color:var(--slate-light);">
                    <li>تخريج 3 أفواج متكاملة (أكثر من 50 شاب وشابة).</li>
                    <li>إعداد سير ذاتية احترافية وملفات LinkedIn متميزة لكل مشارك.</li>
                    <li>نسبة رضا وتقييم إيجابي بلغت 100%.</li>
                </ul>
            `
        },
        en: {
            title: 'Project "Ahlni" — Youth Readiness & Empowerment',
            sub: 'In Partnership with Blumont International',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">Initiative Vision:</h4>
                <p style="margin-bottom:15px; color:var(--slate-light);">Bridging the gap between university graduates and modern job market demands through intensive hands-on training.</p>
                <h4 style="color:var(--gold); margin-bottom:8px;">Impact in Numbers:</h4>
                <ul style="margin-left:20px; margin-bottom:15px; color:var(--slate-light);">
                    <li>3 successful cohorts graduated (50+ youth empowered).</li>
                    <li>100% professional CV & LinkedIn profile creation rate.</li>
                    <li>100% satisfaction rate among beneficiaries and partners.</li>
                </ul>
            `
        }
    },
    ngos: {
        ar: {
            title: 'التكريمات والمشاريع الدولية والشراكات الرسمية',
            sub: 'مع وزير البيئة، GIZ، الاتحاد الأوروبي، ACTED، BDC',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">أهم المحطات التكريمية والرسمية:</h4>
                <ul style="margin-bottom:15px; padding-right:20px; color:var(--slate-light);">
                    <li><strong>تكريم معالي وزير البيئة:</strong> لبناء نماذج الأعمال المستدامة والمبادرات الخضراء.</li>
                    <li><strong>تكريم المدير التنفيذي لـ GIZ:</strong> لقيادة الشراكات التنموية والمشاريع الاقتصادية.</li>
                    <li><strong>تكريم سفير الاتحاد الأوروبي:</strong> لتمثيل التحالفات الاستراتيجية والتنمية المستدامة.</li>
                    <li><strong>جائزة الابتكار التقني:</strong> مؤتمر الشباب والتكنولوجيا مع منظمة ACTED.</li>
                    <li><strong>الموظف المثالي:</strong> مركز تطوير الأعمال (BDC).</li>
                </ul>
            `
        },
        en: {
            title: 'Official Honors & International Strategic Alliances',
            sub: 'With Minister of Environment, GIZ, EU Ambassador, ACTED, BDC',
            content: `
                <h4 style="color:var(--gold); margin-bottom:8px;">Key Official Recognitions & Milestones:</h4>
                <ul style="margin-left:20px; margin-bottom:15px; color:var(--slate-light);">
                    <li><strong>Minister of Environment Recognition:</strong> Sustainable Business Models.</li>
                    <li><strong>GIZ Executive Director Honor:</strong> Economic growth & strategic alliances.</li>
                    <li><strong>EU Ambassador Commendation:</strong> Public-private development partnerships.</li>
                    <li><strong>Tech Innovation Award:</strong> ACTED Youth & Tech Conference.</li>
                    <li><strong>Ideal Employee Award:</strong> Business Development Center (BDC).</li>
                </ul>
            `
        }
    }
};

function openCaseStudy(key) {
    const data = caseStudies[key][lang];
    const html = `
        <h3 style="color:var(--gold); font-size:1.6rem; margin-bottom:6px;">${data.title}</h3>
        <p style="color:var(--cyan); font-size:0.9rem; margin-bottom:20px; font-weight:600;">${data.sub}</p>
        ${data.content}
        <button class="btn-main" onclick="openConsultModal()" style="margin-top:20px; width:100%; justify-content:center;">
            <i class="fas fa-handshake"></i> ${lang === 'ar' ? 'تواصل لمناقشة فرصة شراكة مشابهة' : 'Discuss a Partnership Opportunity'}
        </button>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('case-study-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCaseStudy() {
    document.getElementById('case-study-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function showToolInfo(name) {
    showToast(`${lang === 'ar' ? 'خبرة تنفيذية في' : 'Expertise in'} ${name}`);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyContactInfo(text, label) {
    navigator.clipboard.writeText(text);
    showToast(lang === 'ar' ? `تم نسخ ${label} إلى الحافظة!` : `Copied ${label} to clipboard!`);
}

/* Download vCard Contact */
function downloadVCard() {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Rashid;Mohammad;;;
FN:Mohammad Rashid
TITLE:Strategic Partner | Business Owner | MSc BI Candidate
ORG:Al-Ameen Food Industries & Strategic Ventures
TEL;TYPE=CELL,VOICE:+962777935564
EMAIL:mohammad.r.alhariri@gmail.com
URL:https://linkedin.com/in/mohammad-rashid-alhariri
NOTE:Honored by Minister of Environment, GIZ Exec Director, and EU Ambassador. Founder of Ahlni.
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Mohammad_Rashid.vcf';
    link.click();
    showToast(lang === 'ar' ? 'تم تحضير وتنزيل بطاقة vCard 📇' : 'vCard Downloaded 📇');
}

/* Overlay & Esc Key Modals Handler */
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
            closeCaseStudy();
            closeConsultModal();
        }
    });
});
document.addEventListener('keydown', e => { 
    if(e.key === 'Escape') {
        closeLightbox();
        closeCaseStudy();
        closeConsultModal();
    }
});

/* Language Switcher Logic */
let lang = 'ar';

function setT(id, val, asHTML=false) {
    const el = document.getElementById(id);
    if(!el) return;
    if(asHTML) el.innerHTML = val;
    else el.textContent = val;
}

function toggleLanguage() {
    lang = lang === 'ar' ? 'en' : 'ar';
    const t = T[lang];
    const body = document.getElementById('body');

    if(lang === 'en') { 
        body.classList.add('ltr'); body.dir='ltr'; document.documentElement.lang='en'; 
    } else { 
        body.classList.remove('ltr'); body.dir='rtl'; document.documentElement.lang='ar'; 
    }

    setT('brand-text', t.brandText, true);
    setT('lang-text', lang === 'ar' ? 'EN / عربي' : 'عربي / EN');

    // Nav
    const lnAbout = document.querySelector('.ln-about'); if (lnAbout) lnAbout.textContent = t.navAbout;
    const lnHonors = document.querySelector('.ln-honors'); if (lnHonors) lnHonors.textContent = t.navHonors;
    const lnCalc = document.querySelector('.ln-calc'); if (lnCalc) lnCalc.textContent = t.navCalc;
    const lnSkills = document.querySelector('.ln-skills'); if (lnSkills) lnSkills.textContent = t.navSkills;
    const lnExp = document.querySelector('.ln-exp'); if (lnExp) lnExp.textContent = t.navExp;
    const lnAhlni = document.querySelector('.ln-ahlni'); if (lnAhlni) lnAhlni.textContent = t.navAhlni;
    const lnOffer = document.querySelector('.ln-offer'); if (lnOffer) lnOffer.textContent = t.navOffer;
    const lnGallery = document.querySelector('.ln-gallery'); if (lnGallery) lnGallery.textContent = t.navGallery;

    // Hero
    setT('hero-greeting', t.heroGreeting, true);
    setT('hero-name', t.heroName, true);
    setT('hero-role', t.heroRole, true);
    setT('hero-desc', t.heroDesc, true);
    setT('btn-consult', t.btnConsult);
    setT('btn-vcard', t.btnVcard);
    setT('float-card-title', t.floatCardTitle);
    setT('float-card-sub', t.floatCardSub);

    // Stats
    setT('stat1-label', t.stat1); setT('stat2-label', t.stat2); setT('stat3-label', t.stat3); setT('stat4-label', t.stat4);

    // Honors
    setT('honors-tag', t.honorsTag); setT('honors-title', t.honorsTitle);
    setT('h1-title', t.h1Title); setT('h1-org', t.h1Org); setT('h1-desc', t.h1Desc);
    setT('h2-title', t.h2Title); setT('h2-org', t.h2Org); setT('h2-desc', t.h2Desc);
    setT('h3-title', t.h3Title); setT('h3-org', t.h3Org); setT('h3-desc', t.h3Desc);
    setT('h4-title', t.h4Title); setT('h4-org', t.h4Org); setT('h4-desc', t.h4Desc);

    // About
    setT('about-tag', t.aboutTag); setT('about-title', t.aboutTitle);
    setT('about-p1', t.aboutP1, true); setT('about-p2', t.aboutP2, true); setT('about-p3', t.aboutP3, true);
    setT('btn-about-consult', t.btnAboutConsult); setT('btn-copy-email', t.btnCopyEmail);

    // Calculator
    setT('calc-tag', t.calcTag); setT('calc-title', t.calcTitle); setT('calc-subtitle', t.calcSubtitle);
    setT('lbl-budget', t.lblBudget); setT('lbl-months', t.lblMonths); setT('lbl-channel', t.lblChannel);
    setT('calc-res-head', t.calcResHead); setT('lbl-res-roi', t.lblResRoi); setT('lbl-res-reach', t.lblResReach);
    setT('lbl-res-eff', t.lblResEff); setT('btn-calc-apply', t.btnCalcApply);

    // Skills
    setT('skills-tag', t.skillsTag); setT('skills-title', t.skillsTitle);
    setT('skills-core-title', t.skillsCoreTitle); setT('tools-title', t.toolsTitle); setT('awards-title', t.awardsTitle);
    setT('flt-all', t.fltAll); setT('flt-mkt', t.fltMkt); setT('flt-bi', t.fltBi); setT('flt-sys', t.fltSys); setT('flt-trn', t.fltTrn);
    ['sk1','sk2','sk3','sk4','sk5','sk6'].forEach((id,i) => setT(id, t[`sk${i+1}`]));
    setT('award1-title', t.award1); setT('award2-title', t.award2); setT('award3-title', t.award3);

    // Experience
    setT('exp-tag', t.expTag); setT('exp-title', t.expTitle);
    setT('job1-date', t.job1Date); setT('job1-title', t.job1Title); setT('job1-company', t.job1Company, true);
    setT('job2-date', t.job2Date); setT('job2-title', t.job2Title); setT('job2-company', t.job2Company, true);
    setT('job3-date', t.job3Date); setT('job3-title', t.job3Title); setT('job3-company', t.job3Company, true);
    setT('btn-cs-1', t.btnCs1); setT('btn-cs-2', t.btnCs2);

    // Ahlni
    setT('ahlni-tag', t.ahlniTag); setT('ahlni-title', t.ahlniTitle);
    setT('ahlni-badge', t.ahlniBadge); setT('ahlni-head', t.ahlniHead);
    setT('ahlni-p1', t.ahlniP1, true); setT('ahlni-p2', t.ahlniP2, true);
    setT('ahlni-s1', t.ahlniS1); setT('ahlni-s2', t.ahlniS2); setT('ahlni-s3', t.ahlniS3);
    setT('btn-ahlni-details', t.btnAhlniDetails);

    // Offer
    setT('offer-tag', t.offerTag); setT('offer-title', t.offerTitle);
    ['s1','s2','s3','s4','s5','s6'].forEach(s => { setT(`${s}-title`, t[`${s}t`]); setT(`${s}-desc`, t[`${s}d`]); });

    // Testimonials
    setT('test-tag', t.testTag); setT('test-title', t.testTitle);
    setT('t1-quote', t.t1Quote); setT('t1-author', t.t1Author); setT('t1-role', t.t1Role);
    setT('t2-quote', t.t2Quote); setT('t2-author', t.t2Author); setT('t2-role', t.t2Role);
    setT('t3-quote', t.t3Quote); setT('t3-author', t.t3Author); setT('t3-role', t.t3Role);

    // Certs
    setT('certs-tag', t.certsTag); setT('certs-title', t.certsTitle);
    ['cert1','cert2','cert3','cert4','cert5','cert6'].forEach((id,i) => setT(`${id}-title`, t[`cert${i+1}`]));

    // Gallery
    setT('gallery-tag', t.galleryTag); setT('gallery-title', t.galleryTitle);
    for(let i=1;i<=9;i++){ setT(`g${i}-tag`, t[`g${i}tag`]); setT(`g${i}-title`, t[`g${i}t`]); setT(`g${i}-desc`, t[`g${i}d`]); }

    // Languages
    setT('lang-tag', t.langTag); setT('lang-title', t.langTitle);
    setT('lang1-name', t.lang1); setT('lang1-level', t.langL1);
    setT('lang2-name', t.lang2); setT('lang2-level', t.langL2);
    setT('lang3-name', t.lang3); setT('lang3-level', t.langL3);

    // Contact/Footer & Modals
    setT('contact-tag', t.contactTag); setT('contact-title', t.contactTitle); setT('contact-desc', t.contactDesc);
    setT('btn-footer-consult', t.btnFooterConsult); setT('li-name', t.liName); setT('li-role', t.liRole); setT('li-btn', t.liBtn);
    
    setT('modal-consult-title', t.modalConsultTitle); setT('modal-consult-sub', t.modalConsultSub);
    setT('lbl-service', t.lblService); setT('lbl-name', t.lblName); setT('lbl-notes', t.lblNotes); setT('btn-send-wa', t.btnSendWa);

    updateCalculator();
}
