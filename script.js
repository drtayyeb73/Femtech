// AI-Driven Women's Health & Femtech Hub - JavaScript

function safeRun(fn) {
    try { fn(); } catch (e) { console.error(e); }
}

function readJSON(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        if (!v) return fallback;
        return JSON.parse(v);
    } catch (e) {
        return fallback;
    }
}

function getToastRoot() {
    let root = document.getElementById('toastRoot');
    if (!root) {
        root = document.createElement('div');
        root.id = 'toastRoot';
        root.className = 'toast-root';
        document.body.appendChild(root);
    }
    return root;
}

function showToast(message, durationMs = 2200) {
    const root = getToastRoot();
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    root.appendChild(item);
    setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
    }, durationMs);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    safeRun(enforceDataRetention);
    // Initialize all modules
    safeRun(initNavigation);
    safeRun(initCycleTracking);
    safeRun(initSymptomChecker);
    safeRun(initMenopauseSupport);
    safeRun(initExercises);
    safeRun(initCommunityForum);
    safeRun(initModeToggle);
    safeRun(initThemeToggle);
    safeRun(initNutrition);
    safeRun(initTrends);
    safeRun(initWellness);
    safeRun(initOverlayPages);
    safeRun(initProfile);
    safeRun(initPrivacyControls);
    safeRun(initProviderReport);
    window.addEventListener('resize', () => safeRun(renderTrendsChart));
    window.addEventListener('orientationchange', () => safeRun(renderTrendsChart));
    
    // Set default date for last period (7 days ago)
    const lastPeriodInput = document.getElementById('lastPeriod');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 7);
    lastPeriodInput.valueAsDate = defaultDate;
    
    
    // Initialize calendar
    updateCalendar();
    
    // Calculate and display predictions
    calculatePredictions();
    updatePhaseInsights();
    
    // Load saved data from localStorage
    loadSavedData();
    
    console.log('FemHealth Hub initialized successfully');
});

// ============================================
// NAVIGATION MODULE
// ============================================
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-link');
    const menuIcon = menuToggle?.querySelector('i');
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        if (menuIcon) {
            menuIcon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        }
    });
    
    // Smooth scrolling for navigation links
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (menuIcon) menuIcon.className = 'fas fa-bars';
                }
                
                // Scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active nav item
                navItems.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// ============================================
// MODE TOGGLE (Reproductive Years / Menopause)
// ============================================
function initModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    
    modeToggle.addEventListener('change', function() {
        const isMenopauseMode = this.checked;
        
        // Update UI based on mode
        if (isMenopauseMode) {
            document.body.classList.add('menopause-mode');
            // Scroll to menopause section
            document.querySelector('#menopause').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.body.classList.remove('menopause-mode');
        }
        
        // Save mode preference
        localStorage.setItem('femHealthMode', isMenopauseMode ? 'menopause' : 'reproductive');
        
        // Update content based on mode
        updateContentForMode(isMenopauseMode);
    });
    
    // Load saved mode
    const savedMode = localStorage.getItem('femHealthMode');
    if (savedMode === 'menopause') {
        modeToggle.checked = true;
        document.body.classList.add('menopause-mode');
        updateContentForMode(true);
    }
}

function updateContentForMode(isMenopauseMode) {
    const heroTitle = document.querySelector('.hero h2, .hero h1');
    if (heroTitle) {
        if (isMenopauseMode) {
            heroTitle.textContent = 'Menopause Support & Wellness Hub';
        } else {
            heroTitle.textContent = 'Your Personal AI-Driven Women\'s Health Hub';
        }
    }
    
    // Update section visibility based on mode
    const cycleSection = document.getElementById('tracking');
    const menopauseSection = document.getElementById('menopause');
    
    if (isMenopauseMode) {
        cycleSection.style.opacity = '0.6';
        menopauseSection.style.opacity = '1';
    } else {
        cycleSection.style.opacity = '1';
        menopauseSection.style.opacity = '0.6';
    }
    updatePhaseInsights();
}

// ============================================
// CYCLE TRACKING MODULE
// ============================================
function initCycleTracking() {
    const saveButton = document.getElementById('saveTracking');
    const energySlider = document.getElementById('energyLevel');
    const energyValue = document.getElementById('energyValue');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    // Update energy value display
    energySlider.addEventListener('input', function() {
        energyValue.textContent = this.value;
    });
    
    // Save tracking data
    saveButton.addEventListener('click', function() {
        saveTrackingData();
    });
    
    // Calendar navigation
    prevMonthBtn.addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateCalendar();
    });
    
    // Calculate predictions when inputs change
    document.getElementById('cycleLength').addEventListener('change', calculatePredictions);
    document.getElementById('lastPeriod').addEventListener('change', calculatePredictions);
}

let currentMonth = new Date();

function updateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('currentMonth');
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Set month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearDisplay.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    
    // Get first day of month and total days
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add day cells
    const lastPeriodInput = document.getElementById('lastPeriod');
    const lastPeriod = lastPeriodInput.value ? new Date(lastPeriodInput.value) : null;
    const cycleLength = parseInt(document.getElementById('cycleLength').value) || 28;
    const savedData = readJSON('femHealthTracking', []) || [];
    
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        dayElement.dataset.date = key;
        const hasEntry = savedData.some(item => {
            const t = new Date(item.date);
            const ty = t.getFullYear();
            const tm = String(t.getMonth() + 1).padStart(2, '0');
            const td = String(t.getDate()).padStart(2, '0');
            return `${ty}-${tm}-${td}` === key;
        });
        if (hasEntry) {
            dayElement.classList.add('has-entry');
        }
        dayElement.addEventListener('click', function() {
            showDayDetails(currentDate);
        });
        
        // Check if this day should be marked as period, fertile, or ovulation
        if (lastPeriod) {
            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            // Calculate days since last period
            const timeDiff = currentDate.getTime() - lastPeriod.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            const cycleDay = daysDiff >= 0 ? (daysDiff % cycleLength) : -1;
            
            // Mark period days (first 5 days of cycle)
            if (cycleDay >= 0 && cycleDay < 5) {
                dayElement.classList.add('period');
            }
            
            // Mark fertile window (days 10-15 of cycle)
            if (cycleDay >= 10 && cycleDay <= 15) {
                dayElement.classList.add('fertile');
            }
            
            // Mark ovulation day (day 14 of cycle)
            if (cycleDay === 14) {
                dayElement.classList.add('ovulation');
            }
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function showDayDetails(dateObj) {
    const detailsEl = document.getElementById('dayDetails');
    if (!detailsEl) return;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    const tracking = readJSON('femHealthTracking', []) || [];
    const menopause = readJSON('femHealthMenopause', []) || [];
    const hydration = readJSON('femHealthHydration', []) || [];
    const supplements = readJSON('femHealthSupplements', []) || [];
    const toKey = t => {
        const dt = new Date(t);
        const ty = dt.getFullYear();
        const tm = String(dt.getMonth() + 1).padStart(2, '0');
        const td = String(dt.getDate()).padStart(2, '0');
        return `${ty}-${tm}-${td}`;
    };
    const dayTracking = tracking.filter(item => toKey(item.date) === key);
    const dayMenopause = menopause.filter(item => toKey(item.date) === key);
    const dayHydration = hydration.find(item => toKey(item.date) === key);
    const daySupplements = supplements.find(item => toKey(item.date) === key);
    const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    detailsEl.textContent = '';
    const title = document.createElement('h5');
    title.textContent = dateLabel;
    detailsEl.appendChild(title);

    if (dayTracking.length === 0 && dayMenopause.length === 0 && !dayHydration && !daySupplements) {
        const noneP = document.createElement('p');
        noneP.textContent = 'No entries recorded.';
        detailsEl.appendChild(noneP);
        return;
    }
    if (dayTracking.length > 0) {
        const sec = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = 'Cycle Tracking';
        sec.appendChild(strong);
        detailsEl.appendChild(sec);
        dayTracking.forEach(item => {
            const s = (item.symptoms || []).join(', ') || 'None';
            const p1 = document.createElement('p');
            p1.textContent = `Mood: ${item.mood} | Energy: ${item.energyLevel}`;
            const p2 = document.createElement('p');
            p2.textContent = `Symptoms: ${s}`;
            detailsEl.appendChild(p1);
            detailsEl.appendChild(p2);
        });
    }
    if (dayMenopause.length > 0) {
        const sec = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = 'Menopause';
        sec.appendChild(strong);
        detailsEl.appendChild(sec);
        dayMenopause.forEach(item => {
            const p = document.createElement('p');
            p.textContent = `Hot Flashes: ${item.hotFlashes}, Sleep: ${item.sleep}, Mood: ${item.mood}, Brain Fog: ${item.brainFog}`;
            detailsEl.appendChild(p);
        });
    }
    if (dayHydration) {
        const sec = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = 'Hydration';
        sec.appendChild(strong);
        const p = document.createElement('p');
        p.textContent = `Cups: ${dayHydration.cups}`;
        detailsEl.appendChild(sec);
        detailsEl.appendChild(p);
    }
    if (daySupplements) {
        const list = (daySupplements.items || []).join(', ') || 'None';
        const sec = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = 'Supplements';
        sec.appendChild(strong);
        const p = document.createElement('p');
        p.textContent = list;
        detailsEl.appendChild(sec);
        detailsEl.appendChild(p);
    }
}

function calculatePredictions() {
    const lastPeriodInput = document.getElementById('lastPeriod');
    const cycleLengthInput = document.getElementById('cycleLength');
    
    if (!lastPeriodInput.value) {
        return;
    }
    
    const lastPeriod = new Date(lastPeriodInput.value);
    const cycleLength = parseInt(cycleLengthInput.value) || 28;
    
    // Calculate next period
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    
    // Calculate ovulation (14 days before next period)
    const ovulation = new Date(nextPeriod);
    ovulation.setDate(ovulation.getDate() - 14);
    
    // Calculate fertile window (5 days before ovulation)
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    // Update display
    document.getElementById('nextPeriod').textContent = formatDate(nextPeriod);
    document.getElementById('ovulationDay').textContent = formatDate(ovulation);
    document.getElementById('fertileWindow').textContent = `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}`;
    
    // Update calendar
    updateCalendar();
    updatePhaseInsights();
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function saveTrackingData() {
    const cycleLength = document.getElementById('cycleLength').value;
    const lastPeriod = document.getElementById('lastPeriod').value;
    const mood = document.getElementById('mood').value;
    const energyLevel = document.getElementById('energyLevel').value;
    
    // Get selected symptoms
    const symptomCheckboxes = document.querySelectorAll('.symptom:checked');
    const symptoms = Array.from(symptomCheckboxes).map(cb => cb.value);
    
    // Create tracking data object
    const trackingData = {
        date: new Date().toISOString(),
        cycleLength: parseInt(cycleLength),
        lastPeriod: lastPeriod,
        symptoms: symptoms,
        mood: mood,
        energyLevel: parseInt(energyLevel)
    };
    
    // Save to localStorage
    let savedData = readJSON('femHealthTracking', []) || [];
    savedData.push(trackingData);
    writeArrayWithRetention('femHealthTracking', savedData);
    
    // Show success message
    showToast('Daily tracking data saved successfully.');
    
    // Recalculate predictions
    calculatePredictions();
    safeRun(renderTrendsChart);
}

// ============================================
// SYMPTOM CHECKER MODULE (Mock AI)
// ============================================
function initSymptomChecker() {
    const symptomButtons = document.querySelectorAll('.symptom-btn');
    const analyzeButton = document.getElementById('analyzeSymptoms');
    const buttonsContainer = document.querySelector('.symptom-buttons');
    symptomButtons.forEach(btn => btn.setAttribute('type', 'button'));
    if (buttonsContainer) {
        buttonsContainer.addEventListener('click', function(e) {
            const targetBtn = e.target.closest('.symptom-btn');
            if (!targetBtn) return;
            targetBtn.classList.toggle('active');
            targetBtn.setAttribute('aria-pressed', targetBtn.classList.contains('active') ? 'true' : 'false');
        });
    }
    
    // Analyze symptoms
    if (analyzeButton) {
        analyzeButton.addEventListener('click', function() {
            analyzeSymptoms();
        });
    }
}

function initProfile() {
    const input = document.getElementById('profileName');
    const btn = document.getElementById('saveProfileName');
    if (!input || !btn) return;
    const saved = localStorage.getItem('femHealthUserName') || '';
    if (saved) {
        input.value = saved;
    }
    btn.addEventListener('click', function() {
        const name = input.value.trim();
    localStorage.setItem('femHealthUserName', name);
    showToast('Name saved successfully.');
    });
}

function initOverlayPages() {
    const openAppBtn = document.getElementById('openAboutApp');
    const openUsBtn = document.getElementById('openAboutUs');
    const overlay = document.getElementById('pageOverlay');
    const titleEl = document.getElementById('pageTitle');
    const contentEl = document.getElementById('pageContent');
    const closeBtn = document.getElementById('closeOverlay');
    if (!overlay || !titleEl || !contentEl || !closeBtn) return;
    const showOverlay = (title, sectionId) => {
        titleEl.textContent = title;
        const section = document.getElementById(sectionId);
        contentEl.textContent = '';
        if (section) {
            Array.from(section.childNodes).forEach(node => {
                contentEl.appendChild(node.cloneNode(true));
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'Content not found.';
            contentEl.appendChild(p);
        }
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };
    const hideOverlay = () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    };
    if (openAppBtn) {
        openAppBtn.addEventListener('click', () => showOverlay('About Application', 'about-app'));
    }
    if (openUsBtn) {
        openUsBtn.addEventListener('click', () => showOverlay('About Us - Ahmad Soft', 'about-us'));
    }
    closeBtn.addEventListener('click', hideOverlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideOverlay();
    });
}
function getUserName() {
    return localStorage.getItem('femHealthUserName') || '';
}

// Snapshot feature removed

function analyzeSymptoms() {
    // Get selected symptoms
    const selectedButtons = document.querySelectorAll('.symptom-btn.active');
    const selectedSymptoms = Array.from(selectedButtons).map(btn => btn.dataset.symptom);
    
    // Get custom symptoms
    const customSymptoms = document.getElementById('customSymptom').value;
    
    // Combine all symptoms
    const allSymptoms = [...selectedSymptoms];
    if (customSymptoms.trim()) {
        allSymptoms.push(customSymptoms.toLowerCase());
    }
    
    if (allSymptoms.length === 0) {
        showToast('Please select or describe your symptoms.');
        return;
    }
    
    // Mock AI analysis based on symptoms
    const analysis = getAIRecommendations(allSymptoms);
    
    // Display results safely
    const aiResponse = document.getElementById('aiResponse');
    if (aiResponse) {
        aiResponse.textContent = '';
        const symptomsP = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Based on your symptoms: ';
        symptomsP.appendChild(strong);
        symptomsP.appendChild(document.createTextNode(allSymptoms.join(', ')));
        const summaryP = document.createElement('p');
        summaryP.textContent = analysis.summary;
        aiResponse.appendChild(symptomsP);
        aiResponse.appendChild(summaryP);
    }
    
    document.getElementById('selfCareTips').textContent = analysis.selfCareTips;
    document.getElementById('doctorAdvice').textContent = analysis.doctorAdvice;
    document.getElementById('treatmentOptions').textContent = analysis.treatmentOptions;
    updateWellnessSignalsUI(allSymptoms);
    
    // Save to history
    saveSymptomAnalysis(allSymptoms, analysis);
}

function updateWellnessSignalsUI(symptomsInput = []) {
    const el = document.getElementById('wellnessSignals');
    if (!el) return;
    const hydrationCups = loadHydrationToday();
    const supplements = loadSupplementsToday();
    const lower = (symptomsInput || []).map(s => String(s).toLowerCase());
    const text = lower.join(' ');
    const phase = getCyclePhase();
    const signals = [];

    if (hydrationCups < 6) {
        signals.push(`Hydration is low today (${hydrationCups} cups). Target 6-8 cups.`);
    } else {
        signals.push(`Hydration is on track (${hydrationCups} cups).`);
    }

    if (text.includes('headache') || text.includes('fatigue') || text.includes('dizziness')) {
        if (hydrationCups < 6) {
            signals.push('Low hydration can worsen headache/fatigue/dizziness. Increase water intake.');
        } else {
            signals.push('Hydration support is active for headache/fatigue symptoms.');
        }
    }

    const hasIron = supplements.includes('Iron');
    const hasMagnesium = supplements.includes('Magnesium');
    if ((text.includes('heavy bleeding') || text.includes('fatigue')) && !hasIron) {
        signals.push('Iron is not logged today; consider iron-rich foods and clinical guidance if bleeding/fatigue persists.');
    }
    if ((phase === 'luteal' || text.includes('mood') || text.includes('irritable')) && !hasMagnesium) {
        signals.push('Magnesium not logged today; magnesium support may help mood/PMS comfort for some users.');
    }

    const suppCount = supplements.length;
    if (suppCount > 0) {
        signals.push(`Supplements logged today: ${suppCount} (${supplements.join(', ')}).`);
    } else {
        signals.push('No supplements logged today.');
    }

    signals.push('Wellness integration is active: hydration + supplements are now used in recommendations.');
    el.textContent = signals.join(' ');
}

function getAIRecommendations(symptoms) {
    const lower = symptoms.map(s => String(s).toLowerCase());
    const text = lower.join(' ');
    const mode = localStorage.getItem('femHealthMode') === 'menopause' ? 'menopause' : 'reproductive';
    const lastPeriodVal = document.getElementById('lastPeriod')?.value || '';
    const cycleLen = parseInt(document.getElementById('cycleLength')?.value) || 28;
    const now = new Date();
    let phase = 'unknown';
    if (lastPeriodVal) {
        const lastPeriod = new Date(lastPeriodVal);
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysSince = Math.floor((now - lastPeriod) / msPerDay) % cycleLen;
        if (daysSince <= 5) phase = 'menstruation';
        else if (daysSince <= 12) phase = 'follicular';
        else if (daysSince <= 15) phase = 'ovulation';
        else phase = 'luteal';
    }
    const hasPain = lower.some(s => s.includes('pain') || s.includes('cramp') || s.includes('headache') || s.includes('pelvic'));
    const hasFatigue = lower.some(s => s.includes('fatigue') || s.includes('tired') || s.includes('exhausted'));
    const hasFever = lower.some(s => s.includes('fever') || s.includes('temperature'));
    const hasNausea = lower.some(s => s.includes('nausea') || s.includes('dizziness') || s.includes('vomit'));
    const urinary = text.includes('uti') || text.includes('urination') || text.includes('pee') || text.includes('burning') || text.includes('frequency') || text.includes('urine');
    const discharge = text.includes('discharge') || text.includes('odor') || text.includes('itch') || text.includes('itching');
    const heavyBleeding = text.includes('heavy bleeding') || text.includes('soaking') || text.includes('clots');
    const pelvicPain = text.includes('pelvic') || text.includes('lower abdomen');
    const headache = text.includes('headache') || text.includes('migraine');
    const moodTerms = ['mood', 'irritable', 'anxiety', 'depressed', 'bloating', 'tearful'];
    const hasMood = moodTerms.some(w => text.includes(w));
    const breastTenderness = text.includes('breast tenderness') || text.includes('tender breasts');
    const missedPeriod = text.includes('missed period') || text.includes('late period') || text.includes('amenorrhea');
    const severe = text.includes('severe') || text.includes('unbearable') || text.includes('faint');
    let riskScore = 0;
    if (heavyBleeding) riskScore += 3;
    if (pelvicPain) riskScore += severe ? 3 : 1;
    if (hasFever) riskScore += severe ? 3 : 2;
    if (urinary && hasPain) riskScore += 2;
    if (discharge && severe) riskScore += 2;
    if (missedPeriod && hasPain) riskScore += 2;
    if (mode === 'menopause' && severe) riskScore += 1;
    const redFlags = [];
    if (hasFever && severe) redFlags.push('high fever with severe symptoms');
    if (heavyBleeding) redFlags.push('heavy bleeding');
    if (pelvicPain && severe) redFlags.push('severe pelvic pain');
    if (text.includes('pregnant') && (heavyBleeding || pelvicPain)) redFlags.push('bleeding during pregnancy');
    const summaryParts = [];
    if (urinary && hasPain) summaryParts.push('Possible urinary tract infection');
    if (discharge) summaryParts.push('Possible vaginal infection');
    if (headache && hasNausea) summaryParts.push('Migraine pattern');
    if (phase === 'luteal' && (hasMood || hasPain || breastTenderness)) summaryParts.push('PMS-related symptoms');
    if (phase === 'ovulation' && pelvicPain) summaryParts.push('Ovulation-related pelvic pain');
    if (mode === 'menopause' && (text.includes('hot flashes') || text.includes('sleep') || text.includes('night sweats'))) summaryParts.push('Menopause-related symptom cluster');
    if (missedPeriod && (hasNausea || breastTenderness || hasFatigue)) summaryParts.push('Early pregnancy pattern');
    let summary = summaryParts.length > 0
        ? summaryParts.join('; ') + '.'
        : 'Your symptoms suggest common patterns; here are tailored insights.';
    if (phase !== 'unknown') {
        const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);
        summary = `${summary} Current cycle phase: ${phaseLabel}.`;
    }
    const selfCare = [];
    if (hasPain) selfCare.push('Apply heat, gentle stretching, adequate hydration');
    if (urinary) selfCare.push('Increase fluids, avoid bladder irritants, consider cranberry extract');
    if (discharge) selfCare.push('Use breathable cotton underwear, avoid douching');
    if (headache) selfCare.push('Rest in a dark quiet room; magnesium or riboflavin may help');
    if (hasFatigue) selfCare.push('Prioritize sleep, balanced meals, check iron intake');
    if (phase === 'menstruation') selfCare.push('Plan lighter activity during menstruation and track pain triggers');
    if (mode === 'menopause') selfCare.push('Layer clothing, paced breathing, consistent sleep schedule');
    const selfCareTips = selfCare.join('. ') + (selfCare.length ? '.' : '');
    let doctorAdvice = 'Seek medical care if symptoms persist, worsen, or include concerning features.';
    if (redFlags.length > 0) {
        doctorAdvice = `Urgent attention recommended for: ${redFlags.join(', ')}.`;
    } else if (riskScore >= 5) {
        doctorAdvice = 'High priority: Consult a clinician soon based on your symptom pattern.';
    } else if (riskScore >= 3) {
        doctorAdvice = 'Consider scheduling a consultation; your symptoms suggest elevated concern.';
    }
    const treatments = [];
    if (hasPain) treatments.push('NSAIDs (e.g., ibuprofen) for cramps or pain as appropriate');
    if (urinary) treatments.push('Clinical evaluation for UTI; antibiotics may be indicated');
    if (discharge) treatments.push('Assessment for yeast/BV; antifungal or antibiotic therapy as guided');
    if (headache) treatments.push('Consider migraine-specific therapy (e.g., triptans) after medical review');
    if (mode === 'menopause') treatments.push('Discuss hormone therapy or non-hormonal options with a clinician');
    const treatmentOptions = treatments.join('. ') + (treatments.length ? '.' : ' Track symptoms for pattern-informed care.');
    return {
        summary,
        selfCareTips,
        doctorAdvice,
        treatmentOptions
    };
}

function saveSymptomAnalysis(symptoms, analysis) {
    const analysisRecord = {
        date: new Date().toISOString(),
        symptoms: symptoms,
        analysis: analysis
    };
    
    let savedAnalyses = readJSON('femHealthSymptomAnalyses', []) || [];
    savedAnalyses.push(analysisRecord);
    writeArrayWithRetention('femHealthSymptomAnalyses', savedAnalyses);
}

// ============================================
// MENOPAUSE SUPPORT MODULE
// ============================================
function initMenopauseSupport() {
    const severityButtons = document.querySelectorAll('.severity-btn');
    const saveButton = document.getElementById('saveMenopauseData');
    
    // Handle severity selection
    severityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const symptom = this.dataset.symptom;
            const severity = this.dataset.severity;
            
            // Remove active class from all buttons in this group
            const parentGroup = this.parentElement;
            parentGroup.querySelectorAll('.severity-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update tips based on severity
            updateMenopauseTips(symptom, parseInt(severity));
        });
    });
    
    // Save menopause data
    saveButton.addEventListener('click', function() {
        saveMenopauseData();
    });
}

function updateMenopauseTips(symptom, severity) {
    const tipsContainer = document.getElementById('menopauseTips');
    
    // Update tips based on symptom and severity
    if (symptom === 'hotFlashes' && severity >= 2) {
        // Show additional tips for severe hot flashes
        const hotFlashTip = tipsContainer.querySelector('.tip-card:nth-child(1) p');
        hotFlashTip.textContent = 'For severe hot flashes: Consider hormone therapy, avoid triggers like alcohol and stress, use cooling products, and practice mindfulness.';
    }
    
    if (symptom === 'sleep' && severity === 0) {
        const sleepTip = tipsContainer.querySelector('.tip-card:nth-child(2) p');
        sleepTip.textContent = 'For poor sleep: Establish a consistent sleep schedule, create a cool and dark bedroom environment, limit caffeine after noon, and consider relaxation techniques before bed.';
    }
}

function saveMenopauseData() {
    // Get all severity values
    const hotFlashesSeverity = document.querySelector('.severity-btn.active[data-symptom="hotFlashes"]')?.dataset.severity || '0';
    const sleepSeverity = document.querySelector('.severity-btn.active[data-symptom="sleep"]')?.dataset.severity || '0';
    const moodSeverity = document.querySelector('.severity-btn.active[data-symptom="mood"]')?.dataset.severity || '0';
    const brainFogSeverity = document.querySelector('.severity-btn.active[data-symptom="brainFog"]')?.dataset.severity || '0';
    
    // Create menopause data object
    const menopauseData = {
        date: new Date().toISOString(),
        hotFlashes: parseInt(hotFlashesSeverity),
        sleep: parseInt(sleepSeverity),
        mood: parseInt(moodSeverity),
        brainFog: parseInt(brainFogSeverity)
    };
    
    // Save to localStorage
    let savedData = readJSON('femHealthMenopause', []) || [];
    savedData.push(menopauseData);
    writeArrayWithRetention('femHealthMenopause', savedData);
    
    // Show success message
    showToast('Menopause symptoms saved successfully.');
    
    // Generate personalized tips
    generatePersonalizedTips(menopauseData);
}

function generatePersonalizedTips(data) {
    let tips = [];
    
    if (data.hotFlashes >= 2) {
        tips.push("Consider discussing hormone therapy with your doctor for severe hot flashes.");
    }
    
    if (data.sleep <= 1) {
        tips.push("Try establishing a consistent bedtime routine and keeping your bedroom cool.");
    }
    
    if (data.mood >= 2) {
        tips.push("Regular exercise and mindfulness meditation can help manage mood changes.");
    }
    
    if (data.brainFog >= 2) {
        tips.push("Stay mentally active with puzzles and games, and ensure adequate hydration.");
    }
    
    if (tips.length > 0) {
        // Display personalized tips
        const tipsContainer = document.getElementById('menopauseTips');
        const personalizedTip = document.createElement('div');
        personalizedTip.className = 'tip-card';
        const icon = document.createElement('i');
        icon.className = 'fas fa-user-check';
        const title = document.createElement('h4');
        title.textContent = 'Personalized Tips';
        const p = document.createElement('p');
        p.textContent = tips.join(' ');
        personalizedTip.appendChild(icon);
        personalizedTip.appendChild(title);
        personalizedTip.appendChild(p);
        tipsContainer.prepend(personalizedTip);
    }
}

// ============================================
// PELVIC FLOOR EXERCISES MODULE
// ============================================
function initExercises() {
    const exerciseButtons = document.querySelectorAll('.exercise-btn');
    const startButton = document.getElementById('startExercise');
    const resetButton = document.getElementById('resetExercise');
    const calibrateButton = document.getElementById('calibrateExercise');
    
    // Switch between exercises
    exerciseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const exercise = this.dataset.exercise;
            currentExerciseId = exercise;
            
            // Update active button
            exerciseButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected exercise
            showExercise(exercise);
        });
    });
    
    // Start exercise
    startButton.addEventListener('click', async function() {
        await ensureMotionPermission();
        isAutoRoutine = true;
        startExercise();
    });
    
    // Reset exercise
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetExercise();
        });
    }
    if (calibrateButton) {
        calibrateButton.addEventListener('click', async function() {
            await calibrateCurrentExercise();
        });
    }
    
    loadMotionCalibration();
    applyExerciseVisual();
    setExercisePhase('idle');
    // Check for device motion support
    checkMotionSupport();
}

let exerciseInterval;
let holdTime = 0;
let repetitions = 0;
let isExercising = false;
let relaxationTimeout;
let isAutoRoutine = false;
let motionPermissionGranted = false;
let motionListenerAttached = false;
let currentExerciseId = 'kegel';
let motionSignal = 0;
let lastMotionDetectedAt = 0;
let lowPassGravity = { x: 0, y: 0, z: 0 };
let lastMotionFeedbackAt = 0;
let isCalibratingMotion = false;
let calibrationPeak = 0;
let calibrationSamples = 0;
let currentExercisePhase = 'idle';
let calibratedThresholds = {
    kegel: null,
    bridge: null,
    deepBreathing: null
};

function showExercise(exerciseId) {
    // Hide all exercise cards
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show selected exercise
    const selectedCard = document.getElementById(`${exerciseId}Exercise`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    } else {
        console.warn(`Exercise card not found: ${exerciseId}Exercise. Falling back to Kegels.`);
        const fallbackCard = document.getElementById('kegelExercise');
        if (fallbackCard) fallbackCard.classList.add('active');
    }
    applyExerciseVisual();
    
    // Reset exercise monitor
    resetExercise();
}

function startExercise() {
    if (isExercising) return;
    
    isExercising = true;
    setExercisePhase('contract');
    const startButton = document.getElementById('startExercise');
    startButton.textContent = 'Exercising...';
    startButton.disabled = true;
    
    // Start contraction detection with sensor-assisted signal when available
    exerciseInterval = setInterval(() => {
        if (motionPermissionGranted) {
            simulateContraction(true);
            updateMotionFeedback();
        } else {
            simulateContraction(false);
        }
        
        // Update timer
        holdTime++;
        document.getElementById('holdTimer').textContent = holdTime;
        if (holdTime >= 3) {
            setExercisePhase('hold');
        }
        
        // Check if contraction should end (after 5 seconds)
        if (holdTime >= 5) {
            endContraction();
        }
    }, 1000);
    
    // Update UI
    document.getElementById('movementFeedback').textContent = 'Contract pelvic muscles...';
    document.getElementById('contractionIndicator').style.opacity = '1';
    document.getElementById('contractionIndicator').style.transform = 'translate(-50%, -50%) scale(1)';
}

function endContraction() {
    clearInterval(exerciseInterval);
    isExercising = false;
    
    // Increment repetitions
    repetitions++;
    document.getElementById('repCounter').textContent = repetitions;
    
    // Reset hold timer
    holdTime = 0;
    document.getElementById('holdTimer').textContent = holdTime;
    
    // Update UI for relaxation phase
    setExercisePhase('relax');
    document.getElementById('movementFeedback').textContent = 'Relax for 5 seconds...';
    document.getElementById('contractionIndicator').style.opacity = '0';
    document.getElementById('contractionIndicator').style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    const startButton = document.getElementById('startExercise');
    // Keep button disabled during auto routine
    startButton.textContent = 'Exercising...';
    startButton.disabled = true;
    
    // After 5 seconds of relaxation, automatically start next contraction or finish
    if (relaxationTimeout) clearTimeout(relaxationTimeout);
    relaxationTimeout = setTimeout(() => {
        if (isAutoRoutine && repetitions < 10) {
            document.getElementById('movementFeedback').textContent = 'Starting next contraction...';
            startExercise();
        } else {
            document.getElementById('movementFeedback').textContent = 'Exercise complete! Great job!';
            startButton.textContent = 'Start Exercise';
            startButton.disabled = false;
            isAutoRoutine = false;
        }
    }, 5000);
}

function resetExercise() {
    clearInterval(exerciseInterval);
    if (relaxationTimeout) clearTimeout(relaxationTimeout);
    isExercising = false;
    isAutoRoutine = false;
    
    holdTime = 0;
    repetitions = 0;
    motionSignal = 0;
    lastMotionDetectedAt = 0;
    
    document.getElementById('holdTimer').textContent = holdTime;
    document.getElementById('repCounter').textContent = repetitions;
    document.getElementById('movementFeedback').textContent = 'Ready to start exercise';
    document.getElementById('contractionIndicator').style.opacity = '0';
    document.getElementById('contractionIndicator').style.transform = 'translate(-50%, -50%) scale(0.8)';
    setExercisePhase('idle');
    
    const startButton = document.getElementById('startExercise');
    startButton.textContent = 'Start Exercise';
    startButton.disabled = false;
}

function checkMotionSupport() {
    const sensorStatus = document.getElementById('sensorStatus');
    const fallbackInstructions = document.getElementById('fallbackInstructions');
    
    if (window.DeviceOrientationEvent || window.DeviceMotionEvent) {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            setStatusWithIcon(sensorStatus, 'fas fa-info-circle', 'Motion sensors require permission. Tap Start Exercise to enable.');
            motionPermissionGranted = false;
        } else {
            setStatusWithIcon(sensorStatus, 'fas fa-check-circle', 'Motion sensors available for exercise tracking');
            motionPermissionGranted = true;
            attachMotionListener();
        }
        if (fallbackInstructions) fallbackInstructions.style.display = 'none';
    } else {
        setStatusWithIcon(sensorStatus, 'fas fa-info-circle', 'Using manual exercise tracking');
        motionPermissionGranted = false;
        if (fallbackInstructions) fallbackInstructions.style.display = 'block';
    }
}

function getMotionThreshold(exerciseId) {
    const base = exerciseId === 'bridge' ? 0.9 : (exerciseId === 'deepBreathing' ? 0.22 : 0.15);
    if (typeof calibratedThresholds[exerciseId] === 'number') {
        return calibratedThresholds[exerciseId];
    }
    return base;
}

function applyExerciseVisual() {
    const pelvicVisual = document.getElementById('pelvicVisual');
    if (!pelvicVisual) return;
    pelvicVisual.classList.remove('exercise-kegel', 'exercise-bridge', 'exercise-deepBreathing');
    if (currentExerciseId === 'bridge') {
        pelvicVisual.classList.add('exercise-bridge');
    } else if (currentExerciseId === 'deepBreathing') {
        pelvicVisual.classList.add('exercise-deepBreathing');
    } else {
        pelvicVisual.classList.add('exercise-kegel');
    }
}

function setExercisePhase(phase) {
    const pelvicVisual = document.getElementById('pelvicVisual');
    if (!pelvicVisual) return;
    currentExercisePhase = phase;
    pelvicVisual.classList.remove('phase-idle', 'phase-contract', 'phase-hold', 'phase-relax');
    pelvicVisual.classList.add(`phase-${phase}`);
}

function updateMotionFeedback() {
    const movementFeedback = document.getElementById('movementFeedback');
    if (!movementFeedback) return;

    const now = Date.now();
    if (now - lastMotionFeedbackAt < 800) return;
    lastMotionFeedbackAt = now;

    if (holdTime <= 0) return;

    const threshold = getMotionThreshold(currentExerciseId);
    const recentMotion = (now - lastMotionDetectedAt) < 1800;
    const signalRatio = threshold > 0 ? Math.min(2, motionSignal / threshold) : 0;

    if (recentMotion && signalRatio >= 1) {
        movementFeedback.textContent = 'Good movement detected. Keep steady breathing.';
        return;
    }
    if (currentExerciseId === 'bridge') {
        movementFeedback.textContent = 'Lift and lower gently to register bridge movement.';
    } else if (currentExerciseId === 'deepBreathing') {
        movementFeedback.textContent = 'Take slower deep belly breaths to improve detection.';
    } else {
        movementFeedback.textContent = 'Tiny movement is expected for Kegels; focus on muscle control.';
    }
}

async function ensureMotionPermission() {
    const sensorStatus = document.getElementById('sensorStatus');
    const fallbackInstructions = document.getElementById('fallbackInstructions');

    if (!(window.DeviceOrientationEvent || window.DeviceMotionEvent)) {
        motionPermissionGranted = false;
        if (sensorStatus) setStatusWithIcon(sensorStatus, 'fas fa-info-circle', 'Using manual exercise tracking');
        if (fallbackInstructions) fallbackInstructions.style.display = 'block';
        return false;
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const result = await DeviceMotionEvent.requestPermission();
            motionPermissionGranted = (result === 'granted');
        } catch (error) {
            motionPermissionGranted = false;
        }
    } else {
        motionPermissionGranted = true;
    }

    if (motionPermissionGranted) {
        attachMotionListener();
        if (sensorStatus) setStatusWithIcon(sensorStatus, 'fas fa-check-circle', 'Motion sensors enabled for exercise tracking');
        if (fallbackInstructions) fallbackInstructions.style.display = 'none';
        return true;
    }
    
    if (sensorStatus) setStatusWithIcon(sensorStatus, 'fas fa-info-circle', 'Motion permission denied. Using manual exercise tracking');
    if (fallbackInstructions) fallbackInstructions.style.display = 'block';
    return false;
}

function setStatusWithIcon(targetEl, iconClass, message) {
    if (!targetEl) return;
    targetEl.textContent = '';
    const icon = document.createElement('i');
    icon.className = iconClass;
    targetEl.appendChild(icon);
    targetEl.appendChild(document.createTextNode(` ${message}`));
}

function attachMotionListener() {
    if (motionListenerAttached) return;
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleDeviceMotion);
        motionListenerAttached = true;
    }
}

function loadMotionCalibration() {
    try {
        const saved = JSON.parse(localStorage.getItem('femHealthMotionCalibration') || '{}');
        ['kegel', 'bridge', 'deepBreathing'].forEach(id => {
            if (typeof saved[id] === 'number' && Number.isFinite(saved[id])) {
                calibratedThresholds[id] = saved[id];
            }
        });
    } catch (e) {
        // Ignore malformed saved calibration.
    }
}

function saveMotionCalibration() {
    localStorage.setItem('femHealthMotionCalibration', JSON.stringify(calibratedThresholds));
}

async function calibrateCurrentExercise() {
    const movementFeedback = document.getElementById('movementFeedback');
    const calibrateButton = document.getElementById('calibrateExercise');
    const startButton = document.getElementById('startExercise');

    await ensureMotionPermission();
    if (!motionPermissionGranted) {
        if (movementFeedback) {
            movementFeedback.textContent = 'Cannot calibrate without motion permission.';
        }
        return;
    }
    if (isExercising || isCalibratingMotion) return;

    isCalibratingMotion = true;
    calibrationPeak = 0;
    calibrationSamples = 0;
    motionSignal = 0;

    if (calibrateButton) {
        calibrateButton.disabled = true;
        calibrateButton.textContent = 'Calibrating...';
    }
    if (startButton) startButton.disabled = true;
    if (movementFeedback) {
        movementFeedback.textContent = `Calibrating ${currentExerciseId} for 4 seconds... move as instructed.`;
    }

    setTimeout(() => {
        isCalibratingMotion = false;
        const base = currentExerciseId === 'bridge' ? 0.9 : (currentExerciseId === 'deepBreathing' ? 0.22 : 0.15);
        const candidate = calibrationPeak * 0.45;
        const lower = base * 0.5;
        const upper = base * 2.5;
        const threshold = Math.max(lower, Math.min(upper, candidate || base));
        calibratedThresholds[currentExerciseId] = threshold;
        saveMotionCalibration();

        if (movementFeedback) {
            movementFeedback.textContent = `${currentExerciseId} calibrated. New threshold: ${threshold.toFixed(2)}`;
        }
        if (calibrateButton) {
            calibrateButton.disabled = false;
            calibrateButton.textContent = 'Calibrate';
        }
        if (startButton) startButton.disabled = false;
    }, 4000);
}

function handleDeviceMotion(event) {
    if (!motionPermissionGranted) return;

    let ax = 0;
    let ay = 0;
    let az = 0;

    if (event.acceleration &&
        typeof event.acceleration.x === 'number' &&
        typeof event.acceleration.y === 'number' &&
        typeof event.acceleration.z === 'number') {
        ax = event.acceleration.x;
        ay = event.acceleration.y;
        az = event.acceleration.z;
    } else if (event.accelerationIncludingGravity &&
        typeof event.accelerationIncludingGravity.x === 'number' &&
        typeof event.accelerationIncludingGravity.y === 'number' &&
        typeof event.accelerationIncludingGravity.z === 'number') {
        const alpha = 0.85;
        lowPassGravity.x = alpha * lowPassGravity.x + (1 - alpha) * event.accelerationIncludingGravity.x;
        lowPassGravity.y = alpha * lowPassGravity.y + (1 - alpha) * event.accelerationIncludingGravity.y;
        lowPassGravity.z = alpha * lowPassGravity.z + (1 - alpha) * event.accelerationIncludingGravity.z;
        ax = event.accelerationIncludingGravity.x - lowPassGravity.x;
        ay = event.accelerationIncludingGravity.y - lowPassGravity.y;
        az = event.accelerationIncludingGravity.z - lowPassGravity.z;
    } else {
        return;
    }

    const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    motionSignal = (motionSignal * 0.82) + (magnitude * 0.18);
    const motionLevel = document.getElementById('motionLevel');
    if (motionLevel) {
        motionLevel.textContent = `Motion level: ${motionSignal.toFixed(2)}`;
    }

    if (isCalibratingMotion) {
        calibrationSamples++;
        if (magnitude > calibrationPeak) calibrationPeak = magnitude;
    }

    const threshold = getMotionThreshold(currentExerciseId);
    if (motionSignal >= threshold) {
        lastMotionDetectedAt = Date.now();
    }
}

function simulateContraction(sensorMode = false) {
    // Simulate muscle contraction visualization
    const muscleGroup = document.getElementById('muscleGroup');
    if (!muscleGroup) return;
    const contractionIndicator = document.getElementById('contractionIndicator');

    let basePulse;
    let yShift = 0;
    if (currentExerciseId === 'bridge') {
        basePulse = 1 + Math.sin(Date.now() / 260) * 0.14;
        yShift = Math.sin(Date.now() / 260) * 4;
    } else if (currentExerciseId === 'deepBreathing') {
        basePulse = 1 + Math.sin(Date.now() / 620) * 0.08;
        yShift = Math.sin(Date.now() / 620) * 2;
    } else {
        basePulse = 1 + Math.sin(Date.now() / 190) * 0.09;
        yShift = Math.sin(Date.now() / 190) * 1.5;
    }
    const threshold = getMotionThreshold(currentExerciseId);
    const sensorBoost = sensorMode ? Math.min(0.25, motionSignal / Math.max(threshold, 0.01) * 0.12) : 0;
    const scale = basePulse + sensorBoost;
    muscleGroup.style.transform = `translate(-50%, calc(-50% + ${yShift.toFixed(2)}px)) scale(${scale})`;
    if (contractionIndicator && currentExercisePhase === 'contract') {
        const indicatorScale = currentExerciseId === 'deepBreathing' ? (0.9 + sensorBoost) : (1 + sensorBoost);
        contractionIndicator.style.transform = `translate(-50%, -50%) scale(${indicatorScale})`;
    }
}

// ============================================
// COMMUNITY FORUM MODULE
// ============================================
function initCommunityForum() {
    const savedForumUrl = localStorage.getItem('femtechForumUrl');
    const forumUrl = savedForumUrl || 'https://pregnancyarchive.com/';
    const embed = document.getElementById('forumEmbed');
    const iframe = document.getElementById('forumIframe');
    const forumContainer = document.querySelector('.forum-container');
    const urlInput = document.getElementById('forumUrlInput');
    const saveBtn = document.getElementById('saveForumUrl');
    const clearBtn = document.getElementById('clearForumUrl');
    const statusEl = document.getElementById('forumStatus');
    const openExternalBtn = document.getElementById('openForumExternal');
    const newTopicForm = document.getElementById('newTopicForm');
    const newTopicName = document.getElementById('newTopicName');
    const newTopicDescription = document.getElementById('newTopicDescription');
    const createTopicConfirm = document.getElementById('createTopicConfirm');
    const createTopicCancel = document.getElementById('createTopicCancel');
    const FORUM_EMBED_ALLOWLIST = ['pregnancyarchive.com'];

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg || '';
    }

    function parseForumUrl(value) {
        try {
            const parsed = new URL(value);
            if (parsed.protocol !== 'https:') return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    function isAllowlistedHost(hostname) {
        const host = String(hostname || '').toLowerCase();
        return FORUM_EMBED_ALLOWLIST.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
    }

    function enableExternalForum(url) {
        if (!url) return false;
        const parsed = parseForumUrl(url);
        if (!parsed) {
            setStatus('Invalid forum URL. Use an HTTPS link.');
            return false;
        }
        const host = parsed.hostname;
        if (embed) embed.style.display = 'block';
        if (forumContainer) forumContainer.style.display = 'none';
        if (iframe) {
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
            iframe.setAttribute('referrerpolicy', 'no-referrer');
            iframe.setAttribute('loading', 'lazy');
            if (!isAllowlistedHost(host)) {
                iframe.src = '';
                setStatus(`Embedding disabled for ${host}. Use Open in New Tab.`);
                return true;
            }
            setStatus(`Loading forum${host ? `: ${host}` : ''}...`);
            let loaded = false;
            const warnTimer = setTimeout(function() {
                if (!loaded) {
                    setStatus(`This site may block embedding${host ? `: ${host}` : ''}. Use Open in New Tab.`);
                }
            }, 4000);
            iframe.onload = function() {
                loaded = true;
                clearTimeout(warnTimer);
                setStatus('Forum loaded.');
            };
            iframe.src = parsed.toString();
        }
        return true;
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const val = urlInput?.value?.trim() || '';
            const parsed = parseForumUrl(val);
            if (!parsed) {
                showToast('Please enter a valid HTTPS forum URL.');
                return;
            }
            const normalizedUrl = parsed.toString();
            localStorage.setItem('femtechForumUrl', normalizedUrl);
            enableExternalForum(normalizedUrl);
            showToast('Forum URL saved.');
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            localStorage.removeItem('femtechForumUrl');
            if (embed) embed.style.display = 'none';
            if (forumContainer) forumContainer.style.display = '';
            if (iframe) iframe.src = '';
            if (urlInput) urlInput.value = '';
            setStatus('');
            showToast('Forum disconnected.');
        });
    }
    if (openExternalBtn) {
        openExternalBtn.addEventListener('click', function() {
            const current = urlInput?.value?.trim() || forumUrl;
            if (!current) {
                showToast('No forum URL set.');
                return;
            }
            const parsed = parseForumUrl(current);
            if (!parsed) {
                showToast('Enter a valid HTTPS URL first.');
                return;
            }
            window.open(parsed.toString(), '_blank');
        });
    }
    if (urlInput && forumUrl) {
        urlInput.value = forumUrl;
        setStatus(savedForumUrl
            ? 'Saved forum URL ready. Click Save or Open in New Tab when needed.'
            : 'Default forum URL loaded. Click Connect Forum or Open in New Tab when needed.');
    }
    const topicList = document.querySelector('.topic-list');
    const newTopicBtn = document.getElementById('newTopicBtn');
    const submitPostBtn = document.getElementById('submitPost');
    if (topicList) {
        topicList.addEventListener('click', function(event) {
            const item = event.target?.closest?.('.topic-item');
            if (!item || !topicList.contains(item)) return;
            const topic = item.dataset.topic;
            document.querySelectorAll('.topic-item').forEach(topicItem => {
                topicItem.classList.remove('active');
                topicItem.setAttribute('aria-pressed', 'false');
            });
            item.classList.add('active');
            item.setAttribute('aria-pressed', 'true');
            void loadPostsForTopic(topic);
        });
        topicList.addEventListener('keydown', function(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const item = event.target?.closest?.('.topic-item');
            if (!item || !topicList.contains(item)) return;
            event.preventDefault();
            item.click();
        });
    }
    if (newTopicBtn) {
        newTopicBtn.addEventListener('click', function() {
            if (!newTopicForm) {
                void createNewTopic();
                return;
            }
            newTopicForm.style.display = 'block';
            if (newTopicName) newTopicName.focus();
        });
    }
    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', function() {
            void submitPost();
        });
    }
    if (createTopicConfirm) {
        createTopicConfirm.addEventListener('click', function() {
            void createNewTopic(
                (newTopicName?.value || '').trim(),
                (newTopicDescription?.value || '').trim()
            );
            if (newTopicForm) newTopicForm.style.display = 'none';
            if (newTopicName) newTopicName.value = '';
            if (newTopicDescription) newTopicDescription.value = '';
        });
    }
    if (createTopicCancel) {
        createTopicCancel.addEventListener('click', function() {
            if (newTopicForm) newTopicForm.style.display = 'none';
            if (newTopicName) newTopicName.value = '';
            if (newTopicDescription) newTopicDescription.value = '';
        });
    }
    void refreshForumTopics('cycle').catch(function() {
        setStatus('Forum server unavailable. Start API server to load online forum.');
    });
}
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Check for saved preference
    if (localStorage.getItem('femHealthTheme') === 'dark') {
        body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('femHealthTheme', isDark ? 'dark' : 'light');
        
        // Update icon
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

function initPrivacyControls() {
    const clearBtn = document.getElementById('clearAllData');
    if (!clearBtn) return;
    let armedUntil = 0;
    clearBtn.addEventListener('click', function() {
        const now = Date.now();
        if (now > armedUntil) {
            armedUntil = now + 4000;
            showToast('Click "Clear Local Data" again within 4 seconds to confirm.');
            return;
        }
        armedUntil = 0;
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('femHealth') || key === 'femtechForumUrl') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        showToast('Local app data has been cleared.');
        window.location.reload();
    });
}

function initProviderReport() {
    const exportBtn = document.getElementById('exportProviderPdf');
    if (!exportBtn) return;
    exportBtn.addEventListener('click', function() {
        exportProviderReportPdf();
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toDateKeyFromValue(value) {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDateLong(value) {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTimeLong(value) {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function averageOrDash(values, decimals = 1) {
    if (!values.length) return 'N/A';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(decimals);
}

function collectByRecentDays(list, days) {
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    return (list || []).filter(item => {
        const t = new Date(item?.date || 0).getTime();
        return Number.isFinite(t) && t >= cutoff;
    });
}

function mapLatestByDay(list) {
    const map = {};
    (list || []).forEach(item => {
        const key = toDateKeyFromValue(item?.date);
        if (!key) return;
        const existing = map[key];
        if (!existing) {
            map[key] = item;
            return;
        }
        const existingT = new Date(existing.date || 0).getTime();
        const nextT = new Date(item.date || 0).getTime();
        if (nextT > existingT) map[key] = item;
    });
    return map;
}

function exportProviderReportPdf() {
    const nowIso = new Date().toISOString();
    const now = new Date(nowIso);
    const userName = localStorage.getItem('femHealthUserName') || 'Not provided';
    const mode = localStorage.getItem('femHealthMode') === 'menopause' ? 'Menopause Mode' : 'Reproductive Years';
    const phase = getCyclePhase();
    const phaseLabel = phase === 'unknown' ? 'Unknown' : (phase.charAt(0).toUpperCase() + phase.slice(1));

    const cycleLength = document.getElementById('cycleLength')?.value || 'N/A';
    const lastPeriod = document.getElementById('lastPeriod')?.value || '';
    const nextPeriod = document.getElementById('nextPeriod')?.textContent?.trim() || 'N/A';
    const fertileWindow = document.getElementById('fertileWindow')?.textContent?.trim() || 'N/A';
    const ovulationDay = document.getElementById('ovulationDay')?.textContent?.trim() || 'N/A';

    const trackingRaw = readJSON('femHealthTracking', []) || [];
    const menopauseRaw = readJSON('femHealthMenopause', []) || [];
    const hydrationRaw = readJSON('femHealthHydration', []) || [];
    const supplementsRaw = readJSON('femHealthSupplements', []) || [];
    const symptomAnalysesRaw = readJSON('femHealthSymptomAnalyses', []) || [];

    const tracking = trackingRaw
        .filter(i => i && i.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const menopause = menopauseRaw
        .filter(i => i && i.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const hydration = hydrationRaw
        .filter(i => i && i.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const supplements = supplementsRaw
        .filter(i => i && i.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const symptomAnalyses = symptomAnalysesRaw
        .filter(i => i && i.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const tracking30 = collectByRecentDays(tracking, 30);
    const menopause30 = collectByRecentDays(menopause, 30);
    const hydration30 = collectByRecentDays(hydration, 30);
    const supplements30 = collectByRecentDays(supplements, 30);
    const analyses10 = symptomAnalyses.slice(0, 10);

    const energyAvg30 = averageOrDash(tracking30.map(i => Number(i.energyLevel)).filter(Number.isFinite));
    const symptomCountAvg30 = averageOrDash(tracking30.map(i => Array.isArray(i.symptoms) ? i.symptoms.length : 0));

    const symptomFreq = {};
    tracking30.forEach(i => {
        (i.symptoms || []).forEach(sym => {
            const key = String(sym || '').trim();
            if (!key) return;
            symptomFreq[key] = (symptomFreq[key] || 0) + 1;
        });
    });
    const topSymptoms = Object.entries(symptomFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => `${name} (${count})`);

    const menopauseAvg = {
        hotFlashes: averageOrDash(menopause30.map(i => Number(i.hotFlashes)).filter(Number.isFinite)),
        sleep: averageOrDash(menopause30.map(i => Number(i.sleep)).filter(Number.isFinite)),
        mood: averageOrDash(menopause30.map(i => Number(i.mood)).filter(Number.isFinite)),
        brainFog: averageOrDash(menopause30.map(i => Number(i.brainFog)).filter(Number.isFinite))
    };

    const hydrationAvg30 = averageOrDash(hydration30.map(i => Number(i.cups)).filter(Number.isFinite));
    const supplementsPerDayAvg30 = averageOrDash(
        supplements30.map(i => Array.isArray(i.items) ? i.items.length : 0)
    );
    const supplementFreq = {};
    supplements30.forEach(i => {
        const uniq = new Set(Array.isArray(i.items) ? i.items : []);
        uniq.forEach(name => {
            const key = String(name || '').trim();
            if (!key) return;
            supplementFreq[key] = (supplementFreq[key] || 0) + 1;
        });
    });
    const supplementSummary = Object.entries(supplementFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `${name}: ${count} day(s)`);

    const trackingByDay = mapLatestByDay(tracking);
    const menopauseByDay = mapLatestByDay(menopause);
    const hydrationByDay = mapLatestByDay(hydration);
    const supplementsByDay = mapLatestByDay(supplements);

    const tableRows = [];
    for (let i = 0; i < 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = toDateKeyFromValue(d.toISOString());
        const t = trackingByDay[key];
        const m = menopauseByDay[key];
        const h = hydrationByDay[key];
        const s = supplementsByDay[key];
        tableRows.push({
            date: key,
            mood: t?.mood || '-',
            energy: Number.isFinite(Number(t?.energyLevel)) ? String(t.energyLevel) : '-',
            symptoms: Array.isArray(t?.symptoms) && t.symptoms.length ? t.symptoms.join(', ') : '-',
            menopause: m ? `HF:${m.hotFlashes} Sleep:${m.sleep} Mood:${m.mood} BrainFog:${m.brainFog}` : '-',
            hydration: Number.isFinite(Number(h?.cups)) ? `${h.cups} cups` : '-',
            supplements: Array.isArray(s?.items) && s.items.length ? s.items.join(', ') : '-'
        });
    }

    const analysesRows = analyses10.map(item => {
        const sx = Array.isArray(item.symptoms) ? item.symptoms.join(', ') : '-';
        const advice = item?.analysis?.doctorAdvice || '-';
        return `
            <tr>
                <td>${escapeHtml(formatDateLong(item.date))}</td>
                <td>${escapeHtml(sx)}</td>
                <td>${escapeHtml(advice)}</td>
            </tr>
        `;
    }).join('');

    const dailyRows = tableRows.map(row => `
        <tr>
            <td>${escapeHtml(row.date)}</td>
            <td>${escapeHtml(row.mood)}</td>
            <td>${escapeHtml(row.energy)}</td>
            <td>${escapeHtml(row.symptoms)}</td>
            <td>${escapeHtml(row.menopause)}</td>
            <td>${escapeHtml(row.hydration)}</td>
            <td>${escapeHtml(row.supplements)}</td>
        </tr>
    `).join('');

    const reportHtml = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Provider Health Report</title>
<style>
body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #111827; background: #f8fafc; }
.wrap { max-width: 980px; margin: 0 auto; padding: 18px; background: #fff; }
h1, h2, h3 { margin: 0 0 8px 0; color: #0f172a; }
h1 { font-size: 24px; }
h2 { font-size: 18px; margin-top: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
p { margin: 4px 0; line-height: 1.4; }
.muted { color: #475569; font-size: 13px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
.card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; }
.pill { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 999px; padding: 3px 10px; margin: 4px 6px 0 0; font-size: 12px; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
th { background: #f1f5f9; }
.actions { display: flex; gap: 8px; margin-bottom: 14px; }
.btn { border: 1px solid #334155; background: #0f172a; color: #fff; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
.btn.secondary { background: #fff; color: #0f172a; }
@media print {
    body { background: #fff; }
    .wrap { max-width: 100%; padding: 0; }
    .actions { display: none; }
}
</style>
</head>
<body>
<div class="wrap">
    <div class="actions">
        <button class="btn" onclick="window.print()">Print / Save as PDF</button>
        <button class="btn secondary" onclick="window.close()">Close</button>
    </div>
    <h1>Women's Health Provider Report</h1>
    <p class="muted">Generated: ${escapeHtml(formatDateTimeLong(nowIso))}</p>
    <p class="muted">This report is generated from user-entered local app data for clinical discussion support.</p>

    <h2>Patient Summary</h2>
    <div class="grid">
        <div class="card"><strong>Name:</strong> ${escapeHtml(userName)}</div>
        <div class="card"><strong>App Mode:</strong> ${escapeHtml(mode)}</div>
        <div class="card"><strong>Current Cycle Phase:</strong> ${escapeHtml(phaseLabel)}</div>
        <div class="card"><strong>Last Period Date:</strong> ${escapeHtml(lastPeriod || 'N/A')}</div>
    </div>

    <h2>Cycle & Fertility Overview</h2>
    <div class="grid">
        <div class="card"><strong>Cycle Length:</strong> ${escapeHtml(String(cycleLength))} days</div>
        <div class="card"><strong>Next Period:</strong> ${escapeHtml(nextPeriod)}</div>
        <div class="card"><strong>Fertile Window:</strong> ${escapeHtml(fertileWindow)}</div>
        <div class="card"><strong>Ovulation Day:</strong> ${escapeHtml(ovulationDay)}</div>
    </div>

    <h2>Last 30 Days - Clinical Summary</h2>
    <div class="grid">
        <div class="card"><strong>Cycle Entries:</strong> ${tracking30.length}</div>
        <div class="card"><strong>Avg Energy:</strong> ${escapeHtml(energyAvg30)} / 10</div>
        <div class="card"><strong>Avg Symptom Count:</strong> ${escapeHtml(symptomCountAvg30)} / day</div>
        <div class="card"><strong>AI Symptom Checks:</strong> ${analyses10.length} recent</div>
        <div class="card"><strong>Avg Hydration:</strong> ${escapeHtml(hydrationAvg30)} cups/day</div>
        <div class="card"><strong>Avg Supplements Taken:</strong> ${escapeHtml(supplementsPerDayAvg30)} / day</div>
    </div>

    <h3 style="margin-top:14px;">Top Reported Symptoms (30 days)</h3>
    <p>${topSymptoms.length ? topSymptoms.map(s => `<span class="pill">${escapeHtml(s)}</span>`).join('') : 'No symptom data available.'}</p>

    <h3 style="margin-top:14px;">Menopause Severity Averages (30 days)</h3>
    <p>
        <span class="pill">Hot Flashes: ${escapeHtml(menopauseAvg.hotFlashes)}</span>
        <span class="pill">Sleep Quality: ${escapeHtml(menopauseAvg.sleep)}</span>
        <span class="pill">Mood Changes: ${escapeHtml(menopauseAvg.mood)}</span>
        <span class="pill">Brain Fog: ${escapeHtml(menopauseAvg.brainFog)}</span>
    </p>

    <h3 style="margin-top:14px;">Supplement Logging Frequency (30 days)</h3>
    <p>${supplementSummary.length ? supplementSummary.map(s => `<span class="pill">${escapeHtml(s)}</span>`).join('') : 'No supplement logs in last 30 days.'}</p>

    <h2>Recent AI Symptom Checker Results</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Symptoms</th>
                <th>When to See Doctor Advice</th>
            </tr>
        </thead>
        <tbody>
            ${analysesRows || '<tr><td colspan="3">No recent symptom analyses available.</td></tr>'}
        </tbody>
    </table>

    <h2>Daily Log Snapshot (Last 14 Days)</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Mood</th>
                <th>Energy</th>
                <th>Symptoms</th>
                <th>Menopause Scores</th>
                <th>Hydration</th>
                <th>Supplements</th>
            </tr>
        </thead>
        <tbody>${dailyRows}</tbody>
    </table>

    <h2>Safety Notice</h2>
    <p class="muted">App recommendations are educational and do not replace professional diagnosis, treatment, or emergency care.</p>
</div>
</body>
</html>
`;

    const reportBlob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const reportUrl = URL.createObjectURL(reportBlob);
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (isAndroid) {
        window.__providerReportHtml = reportHtml || '';
        window.__providerReportUrl = '';
        const ok = generateProviderPdfFile();
        if (ok) {
            showToast('Provider PDF opened. Use Share/Save from viewer menu.');
        } else {
            renderProviderReportInline(reportHtml, '');
            showToast('PDF could not open. Report shown in app.');
        }
        setTimeout(() => URL.revokeObjectURL(reportUrl), 120000);
        return;
    }
    let reportWindow = null;
    try {
        reportWindow = window.open(reportUrl, '_blank');
    } catch (_) {
        reportWindow = null;
    }
    if (reportWindow) {
        showToast('Provider report opened. Tap Print and choose Save as PDF.');
        setTimeout(() => URL.revokeObjectURL(reportUrl), 120000);
        return;
    }
    renderProviderReportInline(reportHtml, reportUrl);
    showToast('Report opened in-app. Tap Print and choose Save as PDF.');
}

function renderProviderReportInline(reportHtml, reportUrl) {
    window.__providerReportHtml = reportHtml || '';
    window.__providerReportUrl = reportUrl || '';

    let overlay = document.getElementById('providerReportOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'providerReportOverlay';
        overlay.className = 'provider-report-overlay';
        overlay.innerHTML = [
            '<div class="provider-report-shell">',
            '  <div class="provider-report-header">',
            '    <strong>Provider Report</strong>',
            '    <div class="provider-report-actions">',
            '      <button type="button" id="providerReportPrint" class="btn-secondary" data-action="print">Print / Save PDF</button>',
            '      <button type="button" id="providerReportDownload" class="btn-secondary" data-action="download">Download HTML</button>',
            '      <button type="button" id="providerReportClose" class="btn-secondary" data-action="close">Close</button>',
            '    </div>',
            '  </div>',
            '  <iframe id="providerReportFrame" title="Provider Report"></iframe>',
            '</div>'
        ].join('');
        document.body.appendChild(overlay);

        const printBtn = document.getElementById('providerReportPrint');
        const downloadBtn = document.getElementById('providerReportDownload');
        const closeBtn = document.getElementById('providerReportClose');

        if (printBtn) {
            printBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleProviderReportAction('print');
            });
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleProviderReportAction('download');
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleProviderReportAction('close');
            });
        }

        overlay.addEventListener('click', function(e) {
            const btn = findActionButton(e.target);
            if (btn) {
                handleProviderReportAction(btn.getAttribute('data-action'));
                return;
            }
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    }

    const printBtn = document.getElementById('providerReportPrint');
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (printBtn) {
        printBtn.textContent = isAndroid ? 'Download PDF' : 'Print / Save PDF';
    }

    const frame = document.getElementById('providerReportFrame');
    if (frame) {
        if (isAndroid) {
            frame.srcdoc = window.__providerReportHtml || reportHtml || '';
        } else if (window.__providerReportUrl) {
            frame.src = window.__providerReportUrl;
        } else {
            const blob = new Blob([window.__providerReportHtml], { type: 'text/html;charset=utf-8' });
            frame.src = URL.createObjectURL(blob);
        }
    }

    overlay.style.display = 'flex';
}

function findActionButton(target) {
    let node = target;
    while (node && node !== document) {
        if (node.getAttribute && node.getAttribute('data-action')) return node;
        node = node.parentNode;
    }
    return null;
}

function handleProviderReportAction(action) {
    const overlay = document.getElementById('providerReportOverlay');
    const frame = document.getElementById('providerReportFrame');
    const isAndroid = /Android/i.test(navigator.userAgent || '');

    if (action === 'close') {
        if (overlay) overlay.style.display = 'none';
        return;
    }

    if (action === 'download') {
        const ok = generateProviderReportHtmlDownload();
        if (ok) {
            showToast('Report export started.');
        } else {
            showToast('Could not export file. Report remains visible in app.');
        }
        return;
    }

    if (action === 'print') {
        if (isAndroid) {
            const ok = generateProviderPdfFile();
            if (ok) {
                showToast('PDF export started.');
            } else {
                showToast('PDF could not be generated. Use Download HTML.');
            }
            return;
        }
        try {
            if (frame && frame.contentWindow) {
                frame.contentWindow.focus();
                frame.contentWindow.print();
                return;
            }
        } catch (_) {}
        window.print();
    }
}

function generateProviderReportHtmlDownload() {
    const blob = new Blob([window.__providerReportHtml || ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (isAndroid) {
        const fileName = `provider-report-${new Date().toISOString().slice(0, 10)}.html`;
        const started = tryShareFile(blob, fileName, 'text/html', 'Provider report (HTML)');
        if (!started) {
            copyTextFallback(window.__providerReportHtml || '');
            renderProviderReportInline(window.__providerReportHtml || '', '');
        }
        setTimeout(() => URL.revokeObjectURL(url), 120000);
        return started;
    }
    let opened = false;
    try {
        opened = !!window.open(url, '_blank');
    } catch (_) {}
    if (!opened) {
        const frame = document.getElementById('providerReportFrame');
        if (frame) {
            frame.src = url;
            const overlay = document.getElementById('providerReportOverlay');
            if (overlay) overlay.style.display = 'flex';
            opened = true;
        }
    }
    if (!opened) {
        try { window.location.href = url; } catch (_) {}
    }
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    return opened;
}

function generateProviderPdfFile() {
    const JsPdfCtor = window.jspdf && window.jspdf.jsPDF;
    if (!JsPdfCtor) {
        showToast('PDF engine unavailable. Use Download HTML.');
        return false;
    }

    const doc = new JsPdfCtor({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - (margin * 2);
    let y = 42;

    const ensureRoom = (heightNeeded = 18) => {
        if (y + heightNeeded > pageHeight - 40) {
            doc.addPage();
            y = 42;
        }
    };

    const line = (text, opts = {}) => {
        const size = opts.size || 10;
        const bold = !!opts.bold;
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        const parts = doc.splitTextToSize(String(text || ''), maxWidth);
        ensureRoom(parts.length * (size + 4));
        doc.text(parts, margin, y);
        y += parts.length * (size + 4);
    };

    const section = (title) => {
        y += 6;
        ensureRoom(24);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
        line(title, { bold: true, size: 12 });
    };

    const mode = localStorage.getItem('femHealthMode') === 'menopause' ? 'Menopause Mode' : 'Reproductive Years';
    const phase = getCyclePhase();
    const phaseLabel = phase === 'unknown' ? 'Unknown' : (phase.charAt(0).toUpperCase() + phase.slice(1));
    const userName = localStorage.getItem('femHealthUserName') || 'Not provided';
    const cycleLength = document.getElementById('cycleLength')?.value || 'N/A';
    const lastPeriod = document.getElementById('lastPeriod')?.value || 'N/A';
    const nextPeriod = document.getElementById('nextPeriod')?.textContent?.trim() || 'N/A';
    const fertileWindow = document.getElementById('fertileWindow')?.textContent?.trim() || 'N/A';
    const ovulationDay = document.getElementById('ovulationDay')?.textContent?.trim() || 'N/A';

    const tracking = (readJSON('femHealthTracking', []) || []).filter(i => i && i.date);
    const menopause = (readJSON('femHealthMenopause', []) || []).filter(i => i && i.date);
    const hydration = (readJSON('femHealthHydration', []) || []).filter(i => i && i.date);
    const supplements = (readJSON('femHealthSupplements', []) || []).filter(i => i && i.date);
    const analyses = (readJSON('femHealthSymptomAnalyses', []) || []).filter(i => i && i.date);

    const nowMs = Date.now();
    const last30Cutoff = nowMs - (30 * 24 * 60 * 60 * 1000);
    const tracking30 = tracking.filter(i => new Date(i.date).getTime() >= last30Cutoff);
    const menopause30 = menopause.filter(i => new Date(i.date).getTime() >= last30Cutoff);
    const hydration30 = hydration.filter(i => new Date(i.date).getTime() >= last30Cutoff);
    const supplements30 = supplements.filter(i => new Date(i.date).getTime() >= last30Cutoff);

    const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const energyAvg = avg(tracking30.map(i => Number(i.energyLevel)).filter(Number.isFinite));
    const symptomAvg = avg(tracking30.map(i => Array.isArray(i.symptoms) ? i.symptoms.length : 0));
    const hydrationAvg = avg(hydration30.map(i => Number(i.cups)).filter(Number.isFinite));
    const suppAvg = avg(supplements30.map(i => Array.isArray(i.items) ? i.items.length : 0));

    const symptomFreq = {};
    tracking30.forEach(i => (i.symptoms || []).forEach(s => {
        const key = String(s || '').trim();
        if (!key) return;
        symptomFreq[key] = (symptomFreq[key] || 0) + 1;
    }));
    const topSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

    line("Women's Health Provider Report", { bold: true, size: 16 });
    line(`Generated: ${formatDateTimeLong(new Date().toISOString())}`, { size: 9 });
    line('For clinical discussion support. User-entered data from local app storage.', { size: 9 });

    section('Patient Summary');
    line(`Name: ${userName}`);
    line(`Mode: ${mode}`);
    line(`Current Phase: ${phaseLabel}`);

    section('Cycle & Fertility Overview');
    line(`Cycle Length: ${cycleLength} days`);
    line(`Last Period: ${lastPeriod}`);
    line(`Next Period: ${nextPeriod}`);
    line(`Fertile Window: ${fertileWindow}`);
    line(`Ovulation Day: ${ovulationDay}`);

    section('30-Day Summary');
    line(`Cycle entries: ${tracking30.length}`);
    line(`Average energy: ${energyAvg} / 10`);
    line(`Average symptom count: ${symptomAvg} / day`);
    line(`Average hydration: ${hydrationAvg} cups/day`);
    line(`Average supplements logged: ${suppAvg} / day`);
    line(`Menopause entries: ${menopause30.length}`);
    line(`AI symptom analyses: ${analyses.length}`);

    section('Top Symptoms (30 days)');
    if (!topSymptoms.length) {
        line('No symptom data available.');
    } else {
        topSymptoms.forEach(([name, count]) => line(`- ${name}: ${count} time(s)`));
    }

    section('Recent Daily Entries (up to 10)');
    const recentTracking = tracking.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    if (!recentTracking.length) {
        line('No tracking entries available.');
    } else {
        recentTracking.forEach(item => {
            const dateLabel = formatDateLong(item.date);
            const mood = item.mood || '-';
            const energy = Number.isFinite(Number(item.energyLevel)) ? String(item.energyLevel) : '-';
            const symptoms = Array.isArray(item.symptoms) && item.symptoms.length ? item.symptoms.join(', ') : '-';
            line(`${dateLabel} | Mood: ${mood} | Energy: ${energy} | Symptoms: ${symptoms}`);
        });
    }

    section('Safety Notice');
    line('This report is for educational and wellness tracking support only.');
    line('It is not a substitute for professional diagnosis, treatment, or emergency care.');

    const filenameDate = new Date().toISOString().slice(0, 10);
    const fileName = `provider-report-${filenameDate}.pdf`;
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (isAndroid) {
        try {
            const pdfBlob = doc.output('blob');
            const started = tryShareFile(pdfBlob, fileName, 'application/pdf', 'Provider report (PDF)');
            if (!started) {
                renderProviderReportInline(window.__providerReportHtml || '', '');
            }
            return started;
        } catch (_) {
            return false;
        }
    }
    doc.save(fileName);
    return true;
}

function tryShareFile(blob, fileName, mimeType, titleText) {
    if (!blob) return false;
    try {
        if (navigator.share && window.File) {
            const file = new File([blob], fileName, { type: mimeType });
            const payload = {
                title: titleText || 'Provider report',
                text: 'Share this report with your healthcare provider.',
                files: [file]
            };
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                return false;
            }
            navigator.share(payload).catch(() => {
                copyTextFallback(window.__providerReportHtml || '');
            });
            return true;
        }
    } catch (_) {
        return false;
    }
    return false;
}

function copyTextFallback(text) {
    const plain = String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plain).then(function() {
            showToast('Report text copied to clipboard.');
        }).catch(function() {
            showToast('Unable to copy report automatically.');
        });
    } else {
        showToast('Export blocked on this device. Report is visible in app.');
    }
}

function openProviderPdfUri(uri) {
    if (!uri) return false;
    const isAndroid = /Android/i.test(navigator.userAgent || '');
    if (isAndroid) {
        const frame = document.getElementById('providerReportFrame');
        if (frame) {
            frame.src = uri;
            const overlay = document.getElementById('providerReportOverlay');
            if (overlay) overlay.style.display = 'flex';
            return true;
        }
        return false;
    }
    let opened = false;
    try {
        opened = !!window.open(uri, '_blank');
    } catch (_) {
        opened = false;
    }
    if (!opened) {
        const frame = document.getElementById('providerReportFrame');
        if (frame) {
            frame.src = uri;
            const overlay = document.getElementById('providerReportOverlay');
            if (overlay) overlay.style.display = 'flex';
            opened = true;
        }
    }
    if (!opened) {
        try {
            window.location.href = uri;
            opened = true;
        } catch (_) {
            opened = false;
        }
    }
    return opened;
}

function getDefaultForumApiBase() {
    const configured = localStorage.getItem('femtechForumApiBase');
    if (configured) return configured.replace(/\/+$/, '');
    if (typeof window !== 'undefined' && window.location && /^https?:$/i.test(window.location.protocol)) {
        return `${window.location.origin.replace(/\/+$/, '')}/api`;
    }
    return 'http://localhost:8787/api';
}

const LOCAL_FORUM_TOPICS_KEY = 'femtechLocalForumTopicsV1';
const LOCAL_FORUM_POSTS_KEY = 'femtechLocalForumPostsByTopicV1';
let hasShownLocalForumFallbackNotice = false;

function getDefaultForumTopics() {
    const createdAt = new Date().toISOString();
    return [
        { slug: 'cycle', name: 'Cycle Tracking', description: 'Share experiences and tips', createdAt },
        { slug: 'menopause', name: 'Menopause Support', description: 'Discuss symptoms and coping strategies', createdAt },
        { slug: 'fitness', name: 'Fitness & Wellness', description: 'Exercise tips and motivation', createdAt },
        { slug: 'mental', name: 'Mental Health', description: 'Support for emotional wellbeing', createdAt }
    ];
}

function getLocalForumState() {
    let topics = [];
    let postsByTopic = {};
    try {
        const rawTopics = localStorage.getItem(LOCAL_FORUM_TOPICS_KEY);
        const parsedTopics = rawTopics ? JSON.parse(rawTopics) : null;
        topics = Array.isArray(parsedTopics) ? parsedTopics : [];
    } catch (_) {
        topics = [];
    }
    try {
        const rawPosts = localStorage.getItem(LOCAL_FORUM_POSTS_KEY);
        const parsedPosts = rawPosts ? JSON.parse(rawPosts) : null;
        postsByTopic = parsedPosts && typeof parsedPosts === 'object' ? parsedPosts : {};
    } catch (_) {
        postsByTopic = {};
    }
    if (!topics.length) {
        topics = getDefaultForumTopics();
    }
    return { topics, postsByTopic };
}

function saveLocalForumState(state) {
    localStorage.setItem(LOCAL_FORUM_TOPICS_KEY, JSON.stringify(state.topics || []));
    localStorage.setItem(LOCAL_FORUM_POSTS_KEY, JSON.stringify(state.postsByTopic || {}));
}

function ensureLocalForumFallbackNotice() {
    if (hasShownLocalForumFallbackNotice) return;
    hasShownLocalForumFallbackNotice = true;
    showToast('Online forum is unavailable. Using local forum mode on this device.');
}

function sortPostsByDateDesc(posts) {
    return [...posts].sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
}

function localForumApi(path, options = {}) {
    const method = String(options?.method || 'GET').toUpperCase();
    const state = getLocalForumState();
    const body = options?.body || {};

    if (method === 'GET' && path === '/topics') {
        saveLocalForumState(state);
        return { topics: state.topics };
    }

    if (method === 'POST' && path === '/topics') {
        const name = String(body?.name || '').trim();
        const description = String(body?.description || '').trim();
        const slug = normalizeTopicSlug(body?.slug || name);
        if (!name || name.length < 3) throw new Error('Topic name should be at least 3 characters.');
        if (!slug) throw new Error('Topic name is invalid.');
        if (name.length > 60) throw new Error('Topic name is too long (max 60 characters).');
        if (description.length > 180) throw new Error('Topic description is too long (max 180 characters).');
        if (state.topics.some(t => t?.slug === slug)) throw new Error('A topic with this name already exists.');
        const topic = { slug, name, description, createdAt: new Date().toISOString() };
        state.topics.push(topic);
        if (!Array.isArray(state.postsByTopic[slug])) state.postsByTopic[slug] = [];
        saveLocalForumState(state);
        return { topic };
    }

    const postsPath = path.match(/^\/topics\/([^/]+)\/posts$/);
    if (postsPath && method === 'GET') {
        const slug = normalizeTopicSlug(decodeURIComponent(postsPath[1] || ''));
        if (!slug || !state.topics.some(t => t?.slug === slug)) throw new Error('Topic not found.');
        const posts = Array.isArray(state.postsByTopic[slug]) ? state.postsByTopic[slug] : [];
        return { posts: sortPostsByDateDesc(posts) };
    }

    if (postsPath && method === 'POST') {
        const slug = normalizeTopicSlug(decodeURIComponent(postsPath[1] || ''));
        const title = String(body?.title || '').trim();
        const content = String(body?.content || '').trim();
        const author = String(body?.author || 'Anonymous').trim() || 'Anonymous';
        if (!slug || !state.topics.some(t => t?.slug === slug)) throw new Error('Topic not found.');
        if (!title || !content) throw new Error('Title and content are required.');
        if (title.length > 120) throw new Error('Post title is too long (max 120 characters).');
        if (content.length > 3000) throw new Error('Post content is too long (max 3000 characters).');
        const post = {
            id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title,
            content,
            author: author.slice(0, 60),
            date: new Date().toISOString(),
            replies: []
        };
        if (!Array.isArray(state.postsByTopic[slug])) state.postsByTopic[slug] = [];
        state.postsByTopic[slug].unshift(post);
        state.postsByTopic[slug] = state.postsByTopic[slug].slice(0, 2000);
        saveLocalForumState(state);
        return { post };
    }

    const repliesPath = path.match(/^\/topics\/([^/]+)\/posts\/([^/]+)\/replies$/);
    if (repliesPath && method === 'POST') {
        const slug = normalizeTopicSlug(decodeURIComponent(repliesPath[1] || ''));
        const postId = String(decodeURIComponent(repliesPath[2] || '')).trim();
        const content = String(body?.content || '').trim();
        const author = String(body?.author || 'Anonymous').trim() || 'Anonymous';
        if (!slug || !state.topics.some(t => t?.slug === slug)) throw new Error('Topic not found.');
        if (!postId) throw new Error('Post not found.');
        if (!content) throw new Error('Reply content is required.');
        if (content.length > 1500) throw new Error('Reply is too long (max 1500 characters).');
        const posts = Array.isArray(state.postsByTopic[slug]) ? state.postsByTopic[slug] : [];
        const targetPost = posts.find(p => p && p.id === postId);
        if (!targetPost) throw new Error('Post not found.');
        if (!Array.isArray(targetPost.replies)) targetPost.replies = [];
        const reply = {
            id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            content,
            author: author.slice(0, 60),
            date: new Date().toISOString()
        };
        targetPost.replies.unshift(reply);
        targetPost.replies = targetPost.replies.slice(0, 500);
        saveLocalForumState(state);
        return { reply };
    }

    throw new Error('Forum endpoint unavailable.');
}

function getForumApiCandidates() {
    const list = [];
    const configured = localStorage.getItem('femtechForumApiBase');
    if (configured) list.push(configured.replace(/\/+$/, ''));
    if (typeof window !== 'undefined' && window.location && /^https?:$/i.test(window.location.protocol)) {
        list.push(`${window.location.origin.replace(/\/+$/, '')}/api`);
    }
    list.push('http://localhost:8787/api');
    return [...new Set(list.filter(Boolean))];
}

let resolvedForumApiBase = '';

async function isForumApiAvailable(base) {
    if (!base) return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    try {
        const res = await fetch(`${base}/health`, { signal: controller.signal });
        if (!res.ok) return false;
        const payload = await res.json().catch(() => ({}));
        return !!payload?.ok;
    } catch (_) {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

async function resolveForumApiBase() {
    if (resolvedForumApiBase) return resolvedForumApiBase;
    const candidates = getForumApiCandidates();
    for (const base of candidates) {
        // Prefer a base that is confirmed by /health to avoid false 404 responses.
        if (await isForumApiAvailable(base)) {
            resolvedForumApiBase = base;
            localStorage.setItem('femtechForumApiBase', base);
            return base;
        }
    }
    resolvedForumApiBase = getDefaultForumApiBase();
    return resolvedForumApiBase;
}

async function forumApi(path, options = {}) {
    const reqOptions = {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined
    };
    const preferredBase = await resolveForumApiBase();
    const candidates = [preferredBase, ...getForumApiCandidates().filter(base => base !== preferredBase)];
    let lastError = null;

    for (const base of candidates) {
        try {
            const response = await fetch(`${base}${path}`, reqOptions);
            const payload = await response.json().catch(() => ({}));
            if (response.ok) {
                resolvedForumApiBase = base;
                localStorage.setItem('femtechForumApiBase', base);
                return payload;
            }
            const message = payload?.error || `Forum API error (${response.status})`;
            if (payload?.error) {
                throw new Error(message);
            }
            lastError = new Error(message);
        } catch (error) {
            lastError = error;
            continue;
        }
    }

    ensureLocalForumFallbackNotice();
    try {
        return localForumApi(path, options);
    } catch (fallbackError) {
        throw fallbackError || lastError || new Error('Forum server is unavailable.');
    }
}

function createTopicItemElement(topic, isActive) {
    const item = document.createElement('div');
    item.className = `topic-item${isActive ? ' active' : ''}`;
    item.dataset.topic = String(topic?.slug || '');
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    const icon = document.createElement('i');
    icon.className = 'fas fa-comments';
    const textWrap = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = String(topic?.name || 'Community Topic');
    const description = document.createElement('p');
    description.textContent = String(topic?.description || '');
    textWrap.appendChild(title);
    textWrap.appendChild(description);
    item.appendChild(icon);
    item.appendChild(textWrap);
    return item;
}

async function refreshForumTopics(preferredTopic) {
    const topicList = document.querySelector('.topic-list');
    if (!topicList) return;
    const selectedBefore = document.querySelector('.topic-item.active')?.dataset?.topic || '';
    const preferred = preferredTopic || selectedBefore || 'cycle';
    const payload = await forumApi('/topics');
    const topics = Array.isArray(payload?.topics) ? payload.topics : [];
    if (!topics.length) {
        topicList.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'post';
        empty.textContent = 'No topics available yet.';
        topicList.appendChild(empty);
        await loadPostsForTopic('');
        return;
    }
    const preferredExists = topics.some(t => t?.slug === preferred);
    const activeSlug = preferredExists ? preferred : String(topics[0].slug || '');
    topicList.innerHTML = '';
    topics.forEach(topic => {
        const node = createTopicItemElement(topic, topic.slug === activeSlug);
        topicList.appendChild(node);
    });
    await loadPostsForTopic(activeSlug);
}

// Don't forget to call initThemeToggle() in your DOMContentLoaded listener!
async function loadPostsForTopic(topic) {
    const postsContainer = document.getElementById('postsContainer');
    const topicTitle = document.getElementById('currentTopicTitle');
    if (!postsContainer || !topicTitle) return false;

    if (!topic) {
        topicTitle.textContent = 'Community Discussions';
        postsContainer.innerHTML = '';
        return true;
    }

    const topicNames = {
        'cycle': 'Cycle Tracking Discussions',
        'menopause': 'Menopause Support Group',
        'fitness': 'Fitness & Wellness Community',
        'mental': 'Mental Health Support'
    };
    
    const activeTopicNode = document.querySelector(`.topic-item[data-topic="${topic}"] h4`);
    const customTitle = activeTopicNode ? `${activeTopicNode.textContent} Discussions` : '';
    topicTitle.textContent = topicNames[topic] || customTitle || 'Community Discussions';

    postsContainer.innerHTML = '<div class="post">Loading posts...</div>';
    let posts = [];
    try {
        const payload = await forumApi(`/topics/${encodeURIComponent(topic)}/posts`);
        posts = Array.isArray(payload?.posts) ? payload.posts : [];
    } catch (e) {
        postsContainer.innerHTML = '<div class="post">Unable to load online posts right now.</div>';
        showToast(e?.message || 'Forum server is unavailable.');
        return false;
    }

    postsContainer.innerHTML = '';
    if (!posts.length) {
        const empty = document.createElement('div');
        empty.className = 'post';
        empty.textContent = 'No posts yet. Be the first to post.';
        postsContainer.appendChild(empty);
        return true;
    }
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        const postHeader = document.createElement('div');
        postHeader.className = 'post-header';
        const authorSpan = document.createElement('span');
        authorSpan.textContent = String(post.author || 'Unknown');
        const dateSpan = document.createElement('span');
        dateSpan.textContent = formatDate(new Date(post.date));
        postHeader.appendChild(authorSpan);
        postHeader.appendChild(dateSpan);

        const title = document.createElement('h4');
        title.textContent = String(post.title || '');

        const contentWrap = document.createElement('div');
        contentWrap.className = 'post-content';
        const contentP = document.createElement('p');
        contentP.textContent = String(post.content || '');
        contentWrap.appendChild(contentP);

        const postActions = document.createElement('div');
        postActions.className = 'post-actions';
        const replyBtn = document.createElement('button');
        replyBtn.className = 'btn-secondary reply-btn';
        replyBtn.type = 'button';
        replyBtn.textContent = 'Reply';
        if (!post.id) replyBtn.disabled = true;
        postActions.appendChild(replyBtn);

        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.style.display = 'none';
        const replyInput = document.createElement('textarea');
        replyInput.placeholder = 'Write a reply...';
        const replyActions = document.createElement('div');
        replyActions.className = 'reply-actions';
        const sendReplyBtn = document.createElement('button');
        sendReplyBtn.className = 'btn-primary';
        sendReplyBtn.type = 'button';
        sendReplyBtn.textContent = 'Send Reply';
        const cancelReplyBtn = document.createElement('button');
        cancelReplyBtn.className = 'btn-secondary';
        cancelReplyBtn.type = 'button';
        cancelReplyBtn.textContent = 'Cancel';
        replyActions.appendChild(sendReplyBtn);
        replyActions.appendChild(cancelReplyBtn);
        replyForm.appendChild(replyInput);
        replyForm.appendChild(replyActions);

        const repliesWrap = document.createElement('div');
        repliesWrap.className = 'post-replies';
        const replies = Array.isArray(post.replies) ? post.replies : [];
        if (replies.length) {
            const repliesTitle = document.createElement('h5');
            repliesTitle.textContent = replies.length === 1 ? '1 Reply' : `${replies.length} Replies`;
            repliesWrap.appendChild(repliesTitle);
            replies.forEach(reply => {
                const replyCard = document.createElement('div');
                replyCard.className = 'reply-item';
                const replyHeader = document.createElement('div');
                replyHeader.className = 'reply-header';
                const replyAuthor = document.createElement('span');
                replyAuthor.textContent = String(reply.author || 'Unknown');
                const replyDate = document.createElement('span');
                replyDate.textContent = formatDate(new Date(reply.date));
                replyHeader.appendChild(replyAuthor);
                replyHeader.appendChild(replyDate);
                const replyBody = document.createElement('p');
                replyBody.textContent = String(reply.content || '');
                replyCard.appendChild(replyHeader);
                replyCard.appendChild(replyBody);
                repliesWrap.appendChild(replyCard);
            });
        }

        replyBtn.addEventListener('click', function() {
            replyForm.style.display = 'block';
            replyInput.focus();
        });
        cancelReplyBtn.addEventListener('click', function() {
            replyInput.value = '';
            replyForm.style.display = 'none';
        });
        sendReplyBtn.addEventListener('click', function() {
            const replyContent = replyInput.value.trim();
            if (!replyContent) {
                showToast('Please enter a reply.');
                return;
            }
            if (replyContent.length > 1500) {
                showToast('Reply is too long (max 1500 characters).');
                return;
            }
            if (!post.id) {
                showToast('This post cannot be replied to.');
                return;
            }
            sendReplyBtn.disabled = true;
            void forumApi(`/topics/${encodeURIComponent(topic)}/posts/${encodeURIComponent(post.id)}/replies`, {
                method: 'POST',
                body: {
                    content: replyContent,
                    author: getUserName() || 'You'
                }
            }).then(function() {
                showToast('Reply added.');
                return loadPostsForTopic(topic);
            }).catch(function(e) {
                showToast(e?.message || 'Could not send reply.');
            }).finally(function() {
                sendReplyBtn.disabled = false;
            });
        });

        postElement.appendChild(postHeader);
        postElement.appendChild(title);
        postElement.appendChild(contentWrap);
        postElement.appendChild(postActions);
        postElement.appendChild(replyForm);
        postElement.appendChild(repliesWrap);
        postsContainer.appendChild(postElement);
    });
    return true;
}

async function submitPost() {
    const postTitle = document.getElementById('postTitle').value.trim();
    const postContent = document.getElementById('postContent').value.trim();
    const activeTopicNode = document.querySelector('.topic-item.active');
    const activeTopic = activeTopicNode?.dataset?.topic;
    if (!activeTopic) {
        showToast('Please select a community topic first.');
        return;
    }
    
    if (!postTitle || !postContent) {
        showToast('Please enter both a title and content for your post.');
        return;
    }
    if (postTitle.length > 120) {
        showToast('Post title is too long (max 120 characters).');
        return;
    }
    if (postContent.length > 3000) {
        showToast('Post content is too long (max 3000 characters).');
        return;
    }
    
    try {
        await forumApi(`/topics/${encodeURIComponent(activeTopic)}/posts`, {
            method: 'POST',
            body: {
                title: postTitle,
                content: postContent,
                author: getUserName() || 'You'
            }
        });
    } catch (e) {
        showToast(e?.message || 'Could not post to online forum.');
        return;
    }
    
    // Clear form
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    
    const refreshed = await loadPostsForTopic(activeTopic);
    if (refreshed) {
        showToast('Your post has been shared with the community!');
    }
}

async function createNewTopic(topicNameInput, topicDescriptionInput) {
    const topicName = (topicNameInput || '').trim();
    if (!topicName) {
        showToast('Please enter a topic name.');
        return;
    }
    if (topicName.length < 3) {
        showToast('Topic name should be at least 3 characters.');
        return;
    }
    const topicDescription = (topicDescriptionInput || '').trim();
    const normalizedSlug = normalizeTopicSlug(topicName);
    if (!normalizedSlug) {
        showToast('Topic name is invalid.');
        return;
    }
    if (topicName.length > 60) {
        showToast('Topic name is too long (max 60 characters).');
        return;
    }
    if (topicDescription.length > 180) {
        showToast('Topic description is too long (max 180 characters).');
        return;
    }
    try {
        await forumApi('/topics', {
            method: 'POST',
            body: {
                slug: normalizedSlug,
                name: topicName,
                description: topicDescription
            }
        });
    } catch (e) {
        showToast(e?.message || 'Could not create topic.');
        return;
    }
    await refreshForumTopics(normalizedSlug);
    showToast('New topic created.');
}

function normalizeTopicSlug(input) {
    return String(input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .slice(0, 48);
}


// ============================================
// DATA MANAGEMENT
// ============================================
const RETENTION_POLICY = {
    femHealthTracking: { maxItems: 1200, maxDays: 730 },
    femHealthMenopause: { maxItems: 1200, maxDays: 730 },
    femHealthHydration: { maxItems: 1200, maxDays: 730 },
    femHealthSupplements: { maxItems: 1200, maxDays: 730 },
    femHealthSymptomAnalyses: { maxItems: 1500, maxDays: 730 }
};

function getRetentionForKey(key) {
    if (RETENTION_POLICY[key]) return RETENTION_POLICY[key];
    if (key.startsWith('femHealthPosts_')) return { maxItems: 500, maxDays: 1825 };
    return null;
}

function pruneArrayByRetention(key, list) {
    const policy = getRetentionForKey(key);
    if (!policy || !Array.isArray(list)) return list;
    const now = Date.now();
    const maxAgeMs = policy.maxDays ? policy.maxDays * 24 * 60 * 60 * 1000 : null;
    let pruned = list.filter(item => item && typeof item === 'object');
    if (maxAgeMs) {
        pruned = pruned.filter(item => {
            const t = new Date(item.date || 0).getTime();
            if (!Number.isFinite(t) || t <= 0) return true;
            return (now - t) <= maxAgeMs;
        });
    }
    if (policy.maxItems && pruned.length > policy.maxItems) {
        pruned = pruned.slice(pruned.length - policy.maxItems);
    }
    return pruned;
}

function writeArrayWithRetention(key, list) {
    const pruned = pruneArrayByRetention(key, list);
    localStorage.setItem(key, JSON.stringify(pruned));
    return pruned;
}

function enforceDataRetention() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('femHealth') || key === 'femtechForumUrl') {
            keys.push(key);
        }
    }
    keys.forEach(key => {
        const policy = getRetentionForKey(key);
        if (!policy) return;
        const arr = readJSON(key, null);
        if (Array.isArray(arr)) {
            writeArrayWithRetention(key, arr);
        }
    });
}

function loadSavedData() {
    // This function would load all saved data from localStorage
    // For now, we'll just check what's available
    const trackingData = localStorage.getItem('femHealthTracking');
    const menopauseData = localStorage.getItem('femHealthMenopause');
    
    if (trackingData) {
        console.log('Loaded saved tracking data');
    }
    
    if (menopauseData) {
        console.log('Loaded saved menopause data');
    }
}

// Utility function to format date
Date.prototype.addDays = function(days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function getCyclePhase() {
    const lastPeriodVal = document.getElementById('lastPeriod')?.value || '';
    const cycleLen = parseInt(document.getElementById('cycleLength')?.value) || 28;
    if (!lastPeriodVal) return 'unknown';
    const now = new Date();
    const lastPeriod = new Date(lastPeriodVal);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSince = Math.floor((now - lastPeriod) / msPerDay) % cycleLen;
    if (daysSince <= 5) return 'menstruation';
    if (daysSince <= 12) return 'follicular';
    if (daysSince <= 15) return 'ovulation';
    return 'luteal';
}

function updatePhaseInsights() {
    const el = document.getElementById('phaseInsight');
    if (!el) return;
    const phase = getCyclePhase();
    const mode = localStorage.getItem('femHealthMode') === 'menopause' ? 'menopause' : 'reproductive';
    let msg = '';
    if (mode === 'menopause') {
        msg = 'Menopause support mode is on. Explore tailored tips below.';
    } else {
        if (phase === 'menstruation') msg = 'You may feel lower energy. Try gentle yoga and extra rest.';
        else if (phase === 'follicular') msg = 'Energy often rises. Consider strength training or brisk walks.';
        else if (phase === 'ovulation') msg = 'Peak energy for many. Try a challenging workout today.';
        else if (phase === 'luteal') msg = 'You may feel lower energy. Focus on recovery and light exercise.';
        else msg = 'Provide cycle details to unlock phase-based insights.';
    }
    el.textContent = msg;
}

function initNutrition() {
    const btn = document.getElementById('calculateBmr');
    if (!btn) return;
    btn.addEventListener('click', calculateBMR);
}

function calculateBMR() {
    const age = parseInt(document.getElementById('bmrAge').value);
    const height = parseFloat(document.getElementById('bmrHeight').value);
    const weight = parseFloat(document.getElementById('bmrWeight').value);
    const activity = parseFloat(document.getElementById('activityLevel').value);
    if (!age || !height || !weight || !activity) return;
    const base = 10 * weight + 6.25 * height - 5 * age - 161;
    const phase = getCyclePhase();
    let phaseAdj = 0;
    if (phase === 'luteal') phaseAdj = 0.03;
    else if (phase === 'ovulation') phaseAdj = 0.02;
    else if (phase === 'menstruation') phaseAdj = -0.01;
    const bmr = Math.round(base * (1 + phaseAdj));
    const calories = Math.round(bmr * activity);
    const tipEl = document.getElementById('nutritionPhaseTip');
    const bmrEl = document.getElementById('bmrValue');
    const calEl = document.getElementById('calorieTarget');
    bmrEl.textContent = `${bmr} kcal/day`;
    calEl.textContent = `${calories} kcal/day`;
    let tip = '';
    if (phase === 'luteal') tip = 'Increase complex carbs and magnesium-rich foods.';
    else if (phase === 'menstruation') tip = 'Prioritize iron, hydration, and gentle meals.';
    else if (phase === 'ovulation') tip = 'Lean proteins and plenty of vegetables support energy.';
    else if (phase === 'follicular') tip = 'Balanced macros to fuel training and recovery.';
    else tip = 'Provide cycle details to tailor nutrition tips.';
    tipEl.textContent = tip;
}

let trendsChartInstance;
function initTrends() {
    const metricSelect = document.getElementById('trendsMetric');
    const canvas = document.getElementById('trendsChart');
    if (!metricSelect || !canvas || !window.Chart) return;
    metricSelect.addEventListener('change', renderTrendsChart);
    renderTrendsChart();
}

function renderTrendsChart() {
    const metric = document.getElementById('trendsMetric')?.value || 'energy';
    const trackingRaw = readJSON('femHealthTracking', []) || [];
    const hydrationRaw = readJSON('femHealthHydration', []) || [];
    const supplementsRaw = readJSON('femHealthSupplements', []) || [];
    const data = Array.isArray(trackingRaw) ? trackingRaw : [];
    const hydrationData = Array.isArray(hydrationRaw) ? hydrationRaw : [];
    const supplementsData = Array.isArray(supplementsRaw) ? supplementsRaw : [];
    const today = new Date();
    const labels = [];
    const values = [];
    const dayKeys = [];

    const toKey = (dt) => {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    const hydrationMap = {};
    hydrationData.forEach(item => {
        const k = toKey(new Date(item.date));
        hydrationMap[k] = Number(item.cups || 0);
    });
    const supplementsMap = {};
    const supplementsNamesMap = {};
    supplementsData.forEach(item => {
        const k = toKey(new Date(item.date));
        const names = Array.isArray(item.items) ? item.items : [];
        supplementsMap[k] = names.length;
        supplementsNamesMap[k] = names;
    });

    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${dd}`;
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        dayKeys.push(key);
        const dayEntries = data.filter(item => {
            const t = new Date(item.date);
            const ty = t.getFullYear();
            const tm = String(t.getMonth() + 1).padStart(2, '0');
            const td = String(t.getDate()).padStart(2, '0');
            return `${ty}-${tm}-${td}` === key;
        });
        if (metric === 'energy') {
            const avg = dayEntries.length
                ? Math.round(dayEntries.reduce((sum, e) => sum + Number(e.energyLevel || 0), 0) / dayEntries.length)
                : 0;
            values.push(avg);
        } else if (metric === 'hydration') {
            values.push(Object.prototype.hasOwnProperty.call(hydrationMap, key) ? hydrationMap[key] : null);
        } else if (metric === 'supplements') {
            values.push(Object.prototype.hasOwnProperty.call(supplementsMap, key) ? supplementsMap[key] : null);
        } else {
            const count = dayEntries.length
                ? dayEntries.reduce((sum, e) => {
                    if (Array.isArray(e.symptoms)) return sum + e.symptoms.length;
                    if (typeof e.symptoms === 'string') return sum + (e.symptoms.trim() ? 1 : 0);
                    return sum;
                }, 0)
                : 0;
            values.push(count);
        }
    }
    const ctx = document.getElementById('trendsChart').getContext('2d');
    const chartLabels = {
        energy: 'Energy Level',
        symptomCount: 'Symptom Count',
        hydration: 'Hydration (Cups)',
        supplements: 'Supplements Taken'
    };
    const chartUnits = {
        energy: '/10',
        symptomCount: ' symptoms',
        hydration: ' cups',
        supplements: ' items'
    };
    const palette = {
        energy: { line: '#f97316', fillTop: 'rgba(249,115,22,0.32)', fillBottom: 'rgba(249,115,22,0.04)', point: '#ea580c' },
        symptomCount: { line: '#ef4444', fillTop: 'rgba(239,68,68,0.30)', fillBottom: 'rgba(239,68,68,0.04)', point: '#dc2626' },
        hydration: { line: '#0ea5e9', fillTop: 'rgba(14,165,233,0.32)', fillBottom: 'rgba(14,165,233,0.04)', point: '#0284c7' },
        supplements: { line: '#22c55e', fillTop: 'rgba(34,197,94,0.30)', fillBottom: 'rgba(34,197,94,0.04)', point: '#16a34a' }
    };
    const theme = palette[metric] || palette.energy;
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, theme.fillTop);
    gradient.addColorStop(1, theme.fillBottom);

    if (trendsChartInstance) {
        trendsChartInstance.destroy();
    }
    trendsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: chartLabels[metric] || 'Trend',
                data: values,
                tension: 0.4,
                borderWidth: 3,
                borderColor: theme.line,
                backgroundColor: gradient,
                spanGaps: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBorderWidth: 2,
                pointBorderColor: '#ffffff',
                pointBackgroundColor: theme.point,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#4b5563',
                        font: { size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17,24,39,0.92)',
                    titleColor: '#ffffff',
                    bodyColor: '#f3f4f6',
                    padding: 10,
                    cornerRadius: 10,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null || typeof value === 'undefined') {
                                return ' No data';
                            }
                            if (metric === 'supplements') {
                                const idx = context.dataIndex;
                                const key = dayKeys[idx];
                                const names = supplementsNamesMap[key] || [];
                                if (!names.length) {
                                    return ' Supplements: none logged';
                                }
                                return ` Supplements: ${names.join(', ')}`;
                            }
                            const unit = chartUnits[metric] || '';
                            return ` ${chartLabels[metric] || 'Value'}: ${value}${unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6b7280',
                        maxTicksLimit: 8
                    },
                    grid: {
                        color: 'rgba(148,163,184,0.18)'
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: metric === 'energy' ? 10 : metric === 'hydration' ? 10 : 8,
                    ticks: {
                        color: '#6b7280',
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(148,163,184,0.24)'
                    },
                    title: {
                        display: true,
                        text: chartLabels[metric] || 'Value',
                        color: '#4b5563',
                        font: { weight: '600' }
                    }
                }
            }
        }
    });

}

function initWellness() {
    const addCupBtn = document.getElementById('addCup');
    const resetHydrationBtn = document.getElementById('resetHydration');
    const cupsCountEl = document.getElementById('cupsCount');
    const saveSupplementsBtn = document.getElementById('saveSupplements');
    if (cupsCountEl) {
        cupsCountEl.textContent = String(loadHydrationToday());
    }
    const supplementsToday = loadSupplementsToday();
    document.querySelectorAll('.supplement').forEach(cb => {
        cb.checked = supplementsToday.includes(cb.value);
    });
    if (addCupBtn) {
        addCupBtn.addEventListener('click', () => {
            const current = loadHydrationToday();
            const next = current + 1;
            saveHydrationToday(next);
            cupsCountEl.textContent = String(next);
            updateWellnessSignalsUI();
            safeRun(renderTrendsChart);
            showToast('Logged one cup of water.');
        });
    }
    if (resetHydrationBtn) {
        resetHydrationBtn.addEventListener('click', () => {
            saveHydrationToday(0);
            cupsCountEl.textContent = '0';
            updateWellnessSignalsUI();
            safeRun(renderTrendsChart);
            showToast('Hydration reset for today.');
        });
    }
    if (saveSupplementsBtn) {
        saveSupplementsBtn.addEventListener('click', () => {
            const checks = Array.from(document.querySelectorAll('.supplement:checked'));
            const items = checks.map(cb => cb.value);
            saveSupplementsToday(items);
            updateWellnessSignalsUI();
            safeRun(renderTrendsChart);
            showToast('Supplements saved for today.');
        });
    }
    updateWellnessSignalsUI();
}

function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function saveHydrationToday(cups) {
    const list = readJSON('femHealthHydration', []) || [];
    const key = todayKey();
    const existingIdx = list.findIndex(i => {
        const dt = new Date(i.date);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === key;
    });
    const record = { date: new Date().toISOString(), cups: cups };
    if (existingIdx >= 0) list[existingIdx] = record;
    else list.push(record);
    writeArrayWithRetention('femHealthHydration', list);
}

function loadHydrationToday() {
    const list = readJSON('femHealthHydration', []) || [];
    const key = todayKey();
    const item = list.find(i => {
        const dt = new Date(i.date);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === key;
    });
    return item ? (item.cups || 0) : 0;
}

function saveSupplementsToday(items) {
    const list = readJSON('femHealthSupplements', []) || [];
    const key = todayKey();
    const existingIdx = list.findIndex(i => {
        const dt = new Date(i.date);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === key;
    });
    const record = { date: new Date().toISOString(), items: items };
    if (existingIdx >= 0) list[existingIdx] = record;
    else list.push(record);
    writeArrayWithRetention('femHealthSupplements', list);
}

function loadSupplementsToday() {
    const list = readJSON('femHealthSupplements', []) || [];
    const key = todayKey();
    const item = list.find(i => {
        const dt = new Date(i.date);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === key;
    });
    return item && Array.isArray(item.items) ? item.items : [];
}

// Snapshot functions removed


