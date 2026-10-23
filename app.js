/**
 * AI Vocab Master - Comprehensive Application Engine
 * Integrates Gemini AI, Audio Speech Synthesis, Hierarchical Timeline History (Year -> Date),
 * Word Family Linking, Flashcards, and Local Storage.
 */

// Global State
const STATE = {
  currentWord: null,
  history: [],
  favoritesOnly: false,
  historySearchQuery: '',
  audioSpeed: 1.0,
  defaultVoiceAccent: 'en-US',
  selectedModel: 'gemini-3.1-flash-lite',
  isSidebarOpen: true,
  flashcardIndex: 0,
  flashcardWords: [],
  isCardFlipped: false,
  historyCollapseState: {}
};

// Storage Keys
const STORAGE_KEYS = {
  HISTORY: 'vocab_ai_history_v1',
  MODEL: 'vocab_ai_model',
  THEME: 'vocab_ai_theme',
  VOICE_ACCENT: 'vocab_ai_voice_accent'
};

// ==============================================================
// 1. INITIALIZATION & SETUP
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initTheme();
  initLucide();
  loadHistory();
  bindEvents();

  // If history exists, open the most recent word, else show resilience sample
  if (STATE.history.length > 0) {
    displayWordDetails(STATE.history[0]);
  } else if (window.SAMPLE_WORDS && window.SAMPLE_WORDS.length > 0) {
    // Populate sample words initially for immediate rich experience
    STATE.history = [...window.SAMPLE_WORDS];
    saveHistory();
    renderHistoryTree();
    displayWordDetails(STATE.history[0]);
  }
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadSettings() {
  localStorage.removeItem('vocab_ai_api_key');
  let savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
  if (!savedModel || savedModel.includes('2.5') || savedModel.includes('2.0')) {
    savedModel = 'gemini-3.1-flash-lite';
    localStorage.setItem(STORAGE_KEYS.MODEL, savedModel);
  }
  STATE.selectedModel = savedModel;

  const savedAccent = localStorage.getItem(STORAGE_KEYS.VOICE_ACCENT);
  if (savedAccent) STATE.defaultVoiceAccent = savedAccent;

  const modelSelect = document.getElementById('modelSelect');
  if (modelSelect) modelSelect.value = STATE.selectedModel;

  const accentInputs = document.querySelectorAll('input[name="accentVoice"]');
  accentInputs.forEach(radio => {
    if (radio.value === STATE.defaultVoiceAccent) radio.checked = true;
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcon(false);
  }
}

function updateThemeIcon(isDark) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    initLucide();
  }
}

// ==============================================================
// 2. GEMINI AI & ULTRA-FAST HYBRID DICTIONARY SERVICE
// ==============================================================
async function fetchWordFromAI(word, forceRefresh = false) {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return;

  // 1. FAST LOCAL CACHE CHECK (0ms)
  const cached = STATE.history.find(w => w.word.toLowerCase() === cleanWord) ||
                 (window.SAMPLE_WORDS || []).find(w => w.word.toLowerCase() === cleanWord);

  if (cached && !forceRefresh) {
    displayWordDetails(cached);
    saveWordToHistory(cached);
    document.getElementById('wordInput').value = '';
    toggleClearInputBtn(false);
    showToast(`⚡ Tải tức thì "${cached.word}" từ bộ nhớ`, 'info');
    return;
  }

  setSearchLoading(true);

  try {
    let result = null;

    // Step 1: Try the server-side Gemini proxy
    try {
      result = await callGeminiAPI(cleanWord);
    } catch (geminiError) {
      console.warn('Gemini failed:', geminiError.message);
      if (geminiError.code === 'MISSING_API_KEY' || geminiError.status === 403) throw geminiError;
    }

    // Step 2: If Gemini failed, use Free Dictionary API
    if (!result) {
      result = await fallbackDictionaryLookup(cleanWord);
    }

    if (result) {
      result.is_preview = false;
      saveWordToHistory(result);
      displayWordDetails(result);
      showToast(`Đã tra xong từ "${result.word}"! ⚡`, 'success');
      document.getElementById('wordInput').value = '';
      toggleClearInputBtn(false);
    } else {
      showToast(`Không tìm thấy dữ liệu cho từ "${cleanWord}". Vui lòng thử từ khác.`, 'error');
    }
  } catch (err) {
    console.error('Lookup error:', err);
    showToast(`Có lỗi khi tra từ: ${getApiErrorMessage(err)}`, 'error');
  } finally {
    setSearchLoading(false);
  }
}

/**
 * Call Google Gemini Generative Language API
 */
async function callGeminiAPI(word) {
  let model = STATE.selectedModel || 'gemini-3.1-flash-lite';
  // Filter out retired models
  if (model.includes('2.5') || model.includes('2.0') || model.includes('1.5')) {
    model = 'gemini-3.1-flash-lite';
  }

  const candidateModels = [
    model,
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash'
  ].filter(m => !m.includes('2.5') && !m.includes('2.0') && !m.includes('1.5'));
  const uniqueCandidates = [...new Set(candidateModels)];

  let lastError = null;

  for (const currentModel of uniqueCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, model: currentModel }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = typeof errorData.error === 'string'
          ? errorData.error
          : errorData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);
        lastError.status = response.status;
        lastError.code = errorData.code;

        if (lastError.code === 'MISSING_API_KEY') throw lastError;

        const isModelError = errMsg.includes('no longer available') ||
          errMsg.includes('not found') ||
          errMsg.includes('high demand') ||
          errMsg.includes('service_unavailable') ||
          response.status === 404 || response.status === 503;

        if (isModelError) {
          console.warn(`Model ${currentModel} unavailable, trying next...`);
          continue;
        } else {
          throw lastError;
        }
      }

      const data = await response.json();
      const rawText = data.text;

      if (!rawText) {
        lastError = new Error('API không trả về nội dung');
        continue;
      }

      // Update working model for next time
      if (currentModel !== STATE.selectedModel) {
        STATE.selectedModel = currentModel;
        localStorage.setItem(STORAGE_KEYS.MODEL, currentModel);
        const sel = document.getElementById('modelSelect');
        if (sel) sel.value = currentModel;
      }

      // Parse JSON (strip markdown if present)
      let cleanedText = rawText.trim();
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      }
      // Extract first JSON object if extra text present
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanedText = jsonMatch[0];

      const parsed = JSON.parse(cleanedText);
      parsed.source = 'gemini';
      parsed.timestamp = Date.now();
      return parsed;

    } catch (e) {
      lastError = e;
      const isRetryable = e.name === 'AbortError' ||
        (e.message && (e.message.includes('no longer available') ||
          e.message.includes('not found') ||
          e.message.includes('high demand')));
      if (!isRetryable) throw e;
      console.warn(`Model ${currentModel} failed (${e.message}), retrying next...`);
    }
  }

  throw lastError || new Error('Không thể kết nối đến AI.');
}

/**
 * Fallback Dictionary Service using Free Dictionary API + Local Academic Database
 */
async function fallbackDictionaryLookup(word) {
  // 1. Check local preloaded sample database
  const localMatch = (window.SAMPLE_WORDS || []).find(w => w.word.toLowerCase() === word.toLowerCase());
  if (localMatch) {
    return {
      ...localMatch,
      timestamp: Date.now(),
      source: 'local_database'
    };
  }

  // 2. Query Free Dictionary API (https://dictionaryapi.dev)
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    
    // Extract phonetic & audio
    let phoneticText = entry.phonetic || '';
    let audioUrl = '';
    if (entry.phonetics && entry.phonetics.length > 0) {
      for (const p of entry.phonetics) {
        if (!phoneticText && p.text) phoneticText = p.text;
        if (!audioUrl && p.audio) audioUrl = p.audio;
      }
    }

    // Build meanings
    const meanings = (entry.meanings || []).map(m => {
      const def = m.definitions?.[0] || {};
      const examples = [];
      if (def.example) {
        examples.push({
          en: def.example,
          vi: `(Ví dụ minh họa cho nghĩa ${m.partOfSpeech})`
        });
      }
      return {
        pos: m.partOfSpeech || 'noun',
        definition_en: def.definition || 'No definition available.',
        definition_vi: `[Nghĩa tiếng Việt] ${def.definition || ''}`,
        examples: examples
      };
    });

    // Build word families & synonyms
    const synonyms = [];
    const antonyms = [];
    (entry.meanings || []).forEach(m => {
      if (m.synonyms) synonyms.push(...m.synonyms);
      if (m.antonyms) antonyms.push(...m.antonyms);
    });

    return {
      word: entry.word,
      phonetic_uk: phoneticText || `/${entry.word}/`,
      phonetic_us: phoneticText || `/${entry.word}/`,
      audio_url: audioUrl,
      part_of_speech: entry.meanings?.[0]?.partOfSpeech || 'noun',
      cefr_level: 'B1',
      meanings: meanings,
      word_family: {
        noun: entry.meanings?.some(m => m.partOfSpeech === 'noun') ? [entry.word] : [],
        verb: entry.meanings?.some(m => m.partOfSpeech === 'verb') ? [entry.word] : [],
        adjective: entry.meanings?.some(m => m.partOfSpeech === 'adjective') ? [entry.word] : [],
        adverb: entry.meanings?.some(m => m.partOfSpeech === 'adverb') ? [entry.word] : []
      },
      synonyms: [...new Set(synonyms)].slice(0, 6),
      antonyms: [...new Set(antonyms)].slice(0, 4),
      collocations: [
        { phrase: `use of ${entry.word}`, meaning_vi: `cách dùng của từ ${entry.word}` }
      ],
      memory_tip: `Hãy đặt câu thực tế với từ "${entry.word}" để ghi nhớ ngữ cảnh sử dụng tự nhiên nhất!`,
      source: 'dictionary_api',
      timestamp: Date.now()
    };
  } catch (e) {
    console.error('Free dictionary lookup error:', e);
    return null;
  }
}

// ==============================================================
// 3. HISTORY MANAGEMENT (Grouped by Year -> Date)
// ==============================================================
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      STATE.history = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load history from localStorage:', e);
    STATE.history = [];
  }
  renderHistoryTree();
  updateHistoryTotalCount();
  updateStreak();
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(STATE.history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
  renderHistoryTree();
  updateHistoryTotalCount();
}

function saveWordToHistory(wordObj) {
  // Remove existing entry if it was searched before to bring it to the top
  STATE.history = STATE.history.filter(w => w.word.toLowerCase() !== wordObj.word.toLowerCase());
  
  // Set current lookup timestamp
  wordObj.timestamp = Date.now();
  if (wordObj.is_favorite === undefined) {
    wordObj.is_favorite = false;
  }

  // Prepend to top of history
  STATE.history.unshift(wordObj);
  saveHistory();
}

/**
 * Render Hierarchical History Tree:
 * Year (Năm) -> Date (Ngày tra) -> Words (Danh sách từ)
 */
function renderHistoryTree() {
  const container = document.getElementById('historyTreeContainer');
  if (!container) return;

  // Filter history based on search query or favorites
  let list = STATE.history;

  if (STATE.favoritesOnly) {
    list = list.filter(w => w.is_favorite);
  }

  if (STATE.historySearchQuery) {
    const q = STATE.historySearchQuery.toLowerCase();
    list = list.filter(w => {
      const wordMatch = w.word.toLowerCase().includes(q);
      const defMatch = w.meanings?.some(m => 
        (m.definition_vi && m.definition_vi.toLowerCase().includes(q)) || 
        (m.definition_en && m.definition_en.toLowerCase().includes(q))
      );
      return wordMatch || defMatch;
    });
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400">
        <i data-lucide="history" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-medium">Chưa có lịch sử tra cứu.</p>
        <p class="text-[11px] text-slate-500 mt-1">Các từ bạn tra sẽ được tự động lưu và nhóm theo Năm và Ngày tại đây.</p>
      </div>
    `;
    initLucide();
    return;
  }

  // Group items by Year -> Date
  // Structure: { [year]: { [dateKey]: [words...] } }
  const groups = {};

  list.forEach(item => {
    const d = new Date(item.timestamp || Date.now());
    const year = d.getFullYear(); // Năm
    
    // Format date key: YYYY-MM-DD for sorting, and friendly display string
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // Friendly date label
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === d.getMonth() && today.getDate() === d.getDate();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.getFullYear() === year && yesterday.getMonth() === d.getMonth() && yesterday.getDate() === d.getDate();

    let dateLabel = `Ngày ${day}/${month}`;
    if (isToday) dateLabel = `Hôm nay (${day}/${month})`;
    else if (isYesterday) dateLabel = `Hôm qua (${day}/${month})`;

    if (!groups[year]) groups[year] = {};
    if (!groups[year][dateKey]) {
      groups[year][dateKey] = {
        label: dateLabel,
        items: []
      };
    }
    groups[year][dateKey].items.push(item);
  });

  // Build HTML
  let html = '';

  // Sort Years descending (e.g. 2026, 2025...)
  const sortedYears = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  sortedYears.forEach((year, yIdx) => {
    const yearDates = groups[year];
    const totalWordsInYear = Object.values(yearDates).reduce((acc, cur) => acc + cur.items.length, 0);
    const yearCollapsed = getHistoryGroupCollapsed(`year-${year}`, yIdx > 0);

    html += `
      <!-- YEAR ACCORDION ITEM -->
      <div class="year-group border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50 shadow-xs">
        
        <!-- Year Header Banner -->
        <button 
          onclick="toggleHistoryGroup('year-${year}')"
          aria-expanded="${!yearCollapsed}"
          aria-controls="yearContent-${year}"
          class="w-full px-3 py-2 bg-gradient-to-r from-slate-100/90 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/60 flex items-center justify-between hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand-500"></span>
            <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100 tracking-wide font-mono">NĂM ${year}</span>
            <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              ${totalWordsInYear} từ
            </span>
          </div>
          <i data-lucide="chevron-down" id="yearChevron-${year}" class="w-4 h-4 text-slate-400 transition-transform duration-200 ${yearCollapsed ? 'rotate-180' : ''}"></i>
        </button>

        <!-- Year Container of Dates -->
        <div id="yearContent-${year}" class="p-2 space-y-2.5 ${yearCollapsed ? 'hidden' : ''}">
    `;

    // Sort Dates descending (newest dates first)
    const sortedDates = Object.keys(yearDates).sort().reverse();

    sortedDates.forEach((dateKey, dateIndex) => {
      const dateObj = yearDates[dateKey];
      const count = dateObj.items.length;
      const dateCollapsed = getHistoryGroupCollapsed(`date-${dateKey}`, dateIndex > 0);

      html += `
          <!-- DATE BLOCK (Ngày tra) -->
          <div class="date-group bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-2">
            
            <!-- Date Title Label -->
            <button
              onclick="toggleHistoryGroup('date-${dateKey}')"
              aria-expanded="${!dateCollapsed}"
              aria-controls="dateContent-${dateKey}"
              class="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1"
            >
              <span class="flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3 h-3 text-brand-500"></i>
                <span>${dateObj.label}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-medium">${count}</span>
                <i data-lucide="chevron-down" id="dateChevron-${dateKey}" class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dateCollapsed ? 'rotate-180' : ''}"></i>
              </span>
            </button>

            <!-- Words List for this Date -->
            <div id="dateContent-${dateKey}" class="space-y-1 mt-1.5 ${dateCollapsed ? 'hidden' : ''}">
      `;

      dateObj.items.forEach(wordItem => {
        const isActive = STATE.currentWord && STATE.currentWord.word.toLowerCase() === wordItem.word.toLowerCase();
        const d = new Date(wordItem.timestamp || Date.now());
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        
        // POS badge color mapping
        const pos = (wordItem.part_of_speech || 'noun').toLowerCase();
        let posClass = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
        if (pos.includes('verb')) posClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
        else if (pos.includes('adj')) posClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
        else if (pos.includes('adv')) posClass = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';

        const shortMeaning = wordItem.meanings?.[0]?.definition_vi || wordItem.meanings?.[0]?.definition_en || '';
        const starColor = wordItem.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400';

        html += `
              <div 
                class="history-word-item group flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-brand-400 dark:hover:border-brand-500 transition cursor-pointer ${isActive ? 'active' : ''}"
                onclick="selectWordFromHistory('${escapeHtml(wordItem.word)}')"
              >
                <div class="flex-1 min-w-0 pr-2">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">${escapeHtml(wordItem.word)}</span>
                    <span class="text-[9px] px-1 py-0.2 rounded font-bold uppercase ${posClass}">${pos.slice(0, 3)}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(shortMeaning)}</p>
                </div>

                <!-- Word Item Actions (Pronounce, Star, Delete) -->
                <div class="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  <span class="text-[9px] text-slate-400 mr-1 font-mono">${timeStr}</span>
                  <button 
                    onclick="event.stopPropagation(); playPronunciation('${escapeHtml(wordItem.word)}', 'en-US')" 
                    class="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400" 
                    title="Nghe phát âm"
                  >
                    <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
                  </button>
                  <button 
                    onclick="event.stopPropagation(); toggleFavoriteWord('${escapeHtml(wordItem.word)}')" 
                    class="p-1 rounded ${starColor}" 
                    title="Đánh dấu sao"
                  >
                    <i data-lucide="star" class="w-3.5 h-3.5"></i>
                  </button>
                  <button 
                    onclick="event.stopPropagation(); deleteWordFromHistory('${escapeHtml(wordItem.word)}')" 
                    class="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-rose-500 transition" 
                    title="Xóa từ"
                  >
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
        `;
      });

      html += `
            </div>
          </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initLucide();
}

function getHistoryGroupCollapsed(key, defaultCollapsed) {
  return Object.prototype.hasOwnProperty.call(STATE.historyCollapseState, key)
    ? STATE.historyCollapseState[key]
    : defaultCollapsed;
}

function toggleHistoryGroup(key) {
  const isYear = key.startsWith('year-');
  const id = isYear ? `yearContent-${key.slice(5)}` : `dateContent-${key.slice(5)}`;
  const content = document.getElementById(id);
  if (!content) return;

  const collapsed = !content.classList.contains('hidden');
  STATE.historyCollapseState[key] = collapsed;
  content.classList.toggle('hidden', collapsed);

  const header = content.parentElement?.querySelector(`button[aria-controls="${id}"]`);
  header?.setAttribute('aria-expanded', String(!collapsed));

  const chevron = document.getElementById(`${isYear ? 'yearChevron' : 'dateChevron'}-${key.slice(5)}`);
  chevron?.classList.toggle('rotate-180', collapsed);
}

function selectWordFromHistory(word) {
  const item = STATE.history.find(w => w.word.toLowerCase() === word.toLowerCase());
  if (item) {
    displayWordDetails(item);
    renderHistoryTree(); // Update active highlight
  }
}

function toggleFavoriteWord(word) {
  const item = STATE.history.find(w => w.word.toLowerCase() === word.toLowerCase());
  if (item) {
    item.is_favorite = !item.is_favorite;
    saveHistory();
    if (STATE.currentWord && STATE.currentWord.word.toLowerCase() === word.toLowerCase()) {
      updateCardFavoriteButton(item.is_favorite);
    }
    showToast(item.is_favorite ? `Đã thêm "${word}" vào từ yêu thích!` : `Đã bỏ lưu "${word}".`, 'info');
  }
}

function deleteWordFromHistory(word) {
  STATE.history = STATE.history.filter(w => w.word.toLowerCase() !== word.toLowerCase());
  saveHistory();
  if (STATE.currentWord && STATE.currentWord.word.toLowerCase() === word.toLowerCase()) {
    if (STATE.history.length > 0) {
      displayWordDetails(STATE.history[0]);
    } else {
      showWelcomeScreen();
    }
  }
  showToast(`Đã xóa "${word}" khỏi lịch sử.`, 'info');
}

function clearAllHistory() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tra cứu không?')) {
    STATE.history = [];
    saveHistory();
    showWelcomeScreen();
    showToast('Đã dọn dẹp sạch lịch sử tra cứu!', 'info');
  }
}

function updateHistoryTotalCount() {
  const el = document.getElementById('historyTotalCount');
  if (el) {
    el.textContent = `${STATE.history.length} từ`;
  }
  const badge = document.getElementById('flashcardCountBadge');
  if (badge) {
    badge.textContent = STATE.history.length;
  }
}

function updateStreak() {
  const streakEl = document.getElementById('streakInfo');
  if (!streakEl) return;
  // Calculate unique days in history
  const uniqueDays = new Set(
    STATE.history.map(item => {
      const d = new Date(item.timestamp || Date.now());
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const daysCount = Math.max(1, uniqueDays.size);
  streakEl.innerHTML = `🔥 Chuỗi học: <b class="text-brand-600 dark:text-brand-400 font-bold">${daysCount} ngày</b>`;
}

// ==============================================================
// 4. DISPLAY WORD DETAILS IN MAIN CARD
// ==============================================================
function displayWordDetails(wordData) {
  if (!wordData) return;
  STATE.currentWord = wordData;

  // Toggle views
  document.getElementById('welcomePlaceholder').classList.add('hidden');
  const card = document.getElementById('wordResultCard');
  card.classList.remove('hidden');

  // Trigger fade in animation
  card.classList.remove('animate-fade-in');
  void card.offsetWidth; // force reflow
  card.classList.add('animate-fade-in');

  // 1. Basic Information
  document.getElementById('resultWord').textContent = wordData.word;
  document.getElementById('resultPosBadge').textContent = wordData.part_of_speech || 'noun';
  
  const cefrEl = document.getElementById('resultCefrBadge');
  if (wordData.cefr_level) {
    cefrEl.textContent = wordData.cefr_level;
    cefrEl.classList.remove('hidden');
  } else {
    cefrEl.classList.add('hidden');
  }

  // 2. Phonetics
  document.getElementById('resultPhoneticUk').textContent = wordData.phonetic_uk || `/${wordData.word}/`;
  document.getElementById('resultPhoneticUs').textContent = wordData.phonetic_us || `/${wordData.word}/`;

  // 3. Audio Play Buttons
  document.getElementById('playAudioUkBtn').onclick = () => playPronunciation(wordData.word, 'en-GB', wordData.audio_url);
  document.getElementById('playAudioUsBtn').onclick = () => playPronunciation(wordData.word, 'en-US', wordData.audio_url);

  // 4. Lookup Date in Header
  const d = new Date(wordData.timestamp || Date.now());
  const year = d.getFullYear();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  
  document.getElementById('resultLookupDate').textContent = `${year} - Ngày ${day}/${month}`;
  document.getElementById('resultLookupTime').textContent = time;

  // AI Source badge
  const sourceEl = document.getElementById('aiSourceIndicator');
  if (wordData.is_preview) {
    sourceEl.innerHTML = `<span class="animate-pulse flex items-center gap-1.5 text-[11px] text-amber-500 font-semibold"><i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Đang tối ưu AI sâu...</span>`;
  } else if (wordData.source === 'gemini') {
    sourceEl.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-brand-500"></i> Gemini AI ⚡`;
  } else {
    sourceEl.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5 text-emerald-500"></i> Từ điển siêu tốc ⚡`;
  }

  // Favorite Star Button
  updateCardFavoriteButton(wordData.is_favorite);

  // 5. Word Family (Các từ loại liên quan)
  renderWordFamily(wordData.word_family, wordData.word);

  // 6. Meanings & Examples
  renderMeanings(wordData.meanings, wordData.word);

  // 7. Collocations
  renderCollocations(wordData.collocations);

  // 8. Memory Tip & Synonyms/Antonyms
  document.getElementById('memoryTipText').textContent = wordData.memory_tip || 
    `Hãy đặt câu thực tế với "${wordData.word}" và liên tưởng đến ngữ cảnh sử dụng để ghi nhớ bền lâu.`;

  renderWordChips('synonymsList', wordData.synonyms, 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800');
  renderWordChips('antonymsList', wordData.antonyms, 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800');

  // Copy word button
  document.getElementById('copyWordBtn').onclick = () => {
    const copyContent = `${wordData.word} ${wordData.phonetic_uk || ''}\n${wordData.meanings?.[0]?.definition_vi || ''}`;
    navigator.clipboard.writeText(copyContent);
    showToast(`Đã sao chép từ "${wordData.word}"!`, 'info');
  };

  initLucide();
}

function updateCardFavoriteButton(isFav) {
  const btn = document.getElementById('cardFavoriteBtn');
  if (!btn) return;
  if (isFav) {
    btn.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-amber-500 fill-amber-500"></i>`;
  } else {
    btn.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-slate-400"></i>`;
  }
  btn.onclick = () => {
    if (STATE.currentWord) {
      toggleFavoriteWord(STATE.currentWord.word);
    }
  };
  initLucide();
}

function showWelcomeScreen() {
  STATE.currentWord = null;
  document.getElementById('welcomePlaceholder').classList.remove('hidden');
  document.getElementById('wordResultCard').classList.add('hidden');
}

/**
 * Render Word Family (Noun, Verb, Adjective, Adverb)
 */
function renderWordFamily(family = {}, baseWord = '') {
  const renderList = (elementId, words = []) => {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (!words || words.length === 0) {
      container.innerHTML = `<span class="text-xs text-slate-400 italic">Không có</span>`;
      return;
    }

    container.innerHTML = words.map(w => {
      const isCurrent = w.toLowerCase() === baseWord.toLowerCase();
      return `
        <button 
          onclick="fetchWordFromAI('${escapeHtml(w)}')" 
          class="word-chip px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
            isCurrent 
              ? 'bg-brand-600 text-white border-brand-600 shadow-xs' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600'
          }"
          title="Nhấp để tra từ này"
        >
          ${escapeHtml(w)} ${isCurrent ? '•' : ''}
        </button>
      `;
    }).join('');
  };

  renderList('familyNounList', family.noun);
  renderList('familyVerbList', family.verb);
  renderList('familyAdjList', family.adjective);
  renderList('familyAdvList', family.adverb);
}

/**
 * Render Meanings and Bilingual Examples
 */
function renderMeanings(meanings = [], targetWord = '') {
  const container = document.getElementById('meaningsContainer');
  if (!container) return;

  if (!meanings || meanings.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 italic">Đang cập nhật định nghĩa...</p>`;
    return;
  }

  container.innerHTML = meanings.map((m, idx) => {
    const examplesHtml = (m.examples || []).map(ex => {
      const highlightedEn = highlightWord(ex.en, targetWord);
      return `
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-3 border-brand-500 text-xs space-y-1">
          <p class="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">${highlightedEn}</p>
          <p class="text-slate-500 dark:text-slate-400 italic">${escapeHtml(ex.vi)}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center">${idx + 1}</span>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${escapeHtml(m.pos || 'Nghĩa')}</span>
        </div>

        <div class="space-y-1">
          <h4 class="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 leading-snug">${escapeHtml(m.definition_vi || '')}</h4>
          ${m.definition_en ? `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">${escapeHtml(m.definition_en)}</p>` : ''}
        </div>

        ${examplesHtml ? `
          <div class="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ví dụ minh họa:</span>
            ${examplesHtml}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderCollocations(collocations = []) {
  const container = document.getElementById('collocationsContainer');
  if (!container) return;

  if (!collocations || collocations.length === 0) {
    container.innerHTML = `<span class="text-xs text-slate-400 italic">Đang cập nhật...</span>`;
    return;
  }

  container.innerHTML = collocations.map(c => `
    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
      <span class="font-semibold text-slate-800 dark:text-slate-200">${escapeHtml(c.phrase)}</span>
      <span class="text-slate-500 dark:text-slate-400 text-[11px]">${escapeHtml(c.meaning_vi)}</span>
    </div>
  `).join('');
}

function renderWordChips(containerId, words = [], customClass = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!words || words.length === 0) {
    container.innerHTML = `<span class="text-xs text-slate-400 italic">Không có</span>`;
    return;
  }

  container.innerHTML = words.map(w => `
    <button 
      onclick="fetchWordFromAI('${escapeHtml(w)}')" 
      class="word-chip px-2.5 py-0.8 text-xs font-medium rounded-lg border ${customClass} transition hover:scale-105"
      title="Tra từ ${escapeHtml(w)}"
    >
      ${escapeHtml(w)}
    </button>
  `).join('');
}

function highlightWord(text, word) {
  if (!text || !word) return text;
  const regex = new RegExp(`(\\b${word}\\w*\\b)`, 'gi');
  return text.replace(regex, '<span class="highlight-text font-bold">$1</span>');
}

// ==============================================================
// 5. AUDIO & TEXT-TO-SPEECH (TTS)
// ==============================================================
function playPronunciation(word, lang = 'en-US', fallbackAudioUrl = '') {
  if (!word) return;

  // Try direct audio url if available
  if (fallbackAudioUrl) {
    const audio = new Audio(fallbackAudioUrl);
    audio.playbackRate = STATE.audioSpeed;
    audio.play().catch(() => playWithWebSpeech(word, lang));
    return;
  }

  playWithWebSpeech(word, lang);
}

function playWithWebSpeech(word, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    showToast('Trình duyệt không hỗ trợ phát âm tự động.', 'warning');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = STATE.audioSpeed;

  // Look for high-quality native English voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

function toggleAudioSpeed() {
  if (STATE.audioSpeed === 1.0) STATE.audioSpeed = 0.75;
  else if (STATE.audioSpeed === 0.75) STATE.audioSpeed = 0.5;
  else STATE.audioSpeed = 1.0;

  const textEl = document.getElementById('audioSpeedText');
  if (textEl) {
    textEl.textContent = `${STATE.audioSpeed}x`;
  }
  showToast(`Tốc độ phát âm: ${STATE.audioSpeed}x`, 'info');
}

// ==============================================================
// 6. FLASHCARD REVIEW SYSTEM
// ==============================================================
function openFlashcardModal() {
  if (STATE.history.length === 0) {
    showToast('Chưa có từ nào trong lịch sử để ôn luyện.', 'warning');
    return;
  }

  STATE.flashcardWords = [...STATE.history];
  STATE.flashcardIndex = 0;
  STATE.isCardFlipped = false;

  updateFlashcardView();
  document.getElementById('flashcardModal').classList.remove('hidden');
}

function closeFlashcardModal() {
  document.getElementById('flashcardModal').classList.add('hidden');
}

function updateFlashcardView() {
  const card = STATE.flashcardWords[STATE.flashcardIndex];
  if (!card) return;

  // Reset flip
  const inner = document.getElementById('flashcardInner');
  inner.classList.remove('is-flipped');
  STATE.isCardFlipped = false;

  // Front side
  document.getElementById('fcFrontWord').textContent = card.word;
  document.getElementById('fcFrontPos').textContent = card.part_of_speech || 'noun';
  document.getElementById('fcFrontPhonetic').textContent = card.phonetic_uk || card.phonetic_us || `/${card.word}/`;
  
  // Front audio button
  document.getElementById('fcPlayAudioBtn').onclick = (e) => {
    e.stopPropagation();
    playPronunciation(card.word, 'en-US');
  };

  // Back side
  const meaning = card.meanings?.[0]?.definition_vi || 'Chưa có bản dịch';
  const example = card.meanings?.[0]?.examples?.[0]?.en || '';
  
  document.getElementById('fcBackMeaning').textContent = meaning;
  document.getElementById('fcBackExample').textContent = example ? `"${example}"` : '';

  // Progress text
  document.getElementById('flashcardProgressText').textContent = 
    `Từ ${STATE.flashcardIndex + 1} / ${STATE.flashcardWords.length}`;

  initLucide();
}

function flipFlashcard() {
  const inner = document.getElementById('flashcardInner');
  STATE.isCardFlipped = !STATE.isCardFlipped;
  inner.classList.toggle('is-flipped', STATE.isCardFlipped);
}

function nextFlashcard() {
  if (STATE.flashcardIndex < STATE.flashcardWords.length - 1) {
    STATE.flashcardIndex++;
    updateFlashcardView();
  } else {
    showToast('Bạn đã hoàn thành lượt ôn luyện tất cả các từ!', 'success');
    fireConfetti();
  }
}

function prevFlashcard() {
  if (STATE.flashcardIndex > 0) {
    STATE.flashcardIndex--;
    updateFlashcardView();
  }
}

function markCardKnown() {
  fireConfetti();
  showToast(`Đã thuộc từ "${STATE.flashcardWords[STATE.flashcardIndex]?.word}"! Tuyệt vời! 🎉`, 'success');
  setTimeout(() => {
    nextFlashcard();
  }, 400);
}

function fireConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  }
}

// ==============================================================
// 7. EXPORT DATA (CSV / JSON)
// ==============================================================
function exportHistoryData() {
  if (STATE.history.length === 0) {
    showToast('Lịch sử trống, không có dữ liệu để xuất.', 'warning');
    return;
  }

  // Format as CSV
  const headers = ['Từ (Word)', 'Từ loại', 'Phiên âm', 'Nghĩa tiếng Việt', 'Ví dụ', 'Năm tra', 'Ngày tra', 'Giờ tra'];
  const rows = STATE.history.map(item => {
    const d = new Date(item.timestamp || Date.now());
    const year = d.getFullYear();
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    const timeStr = `${d.getHours()}:${d.getMinutes()}`;
    const meaning = (item.meanings?.[0]?.definition_vi || '').replace(/"/g, '""');
    const example = (item.meanings?.[0]?.examples?.[0]?.en || '').replace(/"/g, '""');

    return [
      `"${item.word}"`,
      `"${item.part_of_speech || ''}"`,
      `"${item.phonetic_uk || item.phonetic_us || ''}"`,
      `"${meaning}"`,
      `"${example}"`,
      year,
      `"${dateStr}"`,
      `"${timeStr}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `vocab_history_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Đã xuất lịch sử ra file CSV thành công!', 'success');
}

// ==============================================================
// 8. EVENT LISTENERS & UI INTERACTIONS
// ==============================================================
function bindEvents() {
  // Search Form Submit
  const searchForm = document.getElementById('searchForm');
  const wordInput = document.getElementById('wordInput');
  const clearInputBtn = document.getElementById('clearInputBtn');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = wordInput.value.trim();
    if (val) {
      fetchWordFromAI(val);
    }
  });

  // Input typing controls
  wordInput.addEventListener('input', () => {
    toggleClearInputBtn(wordInput.value.length > 0);
  });

  clearInputBtn.addEventListener('click', () => {
    wordInput.value = '';
    toggleClearInputBtn(false);
    wordInput.focus();
  });

  // Quick word suggestion buttons
  document.querySelectorAll('.quick-word').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = btn.textContent.trim();
      wordInput.value = w;
      fetchWordFromAI(w);
    });
  });

  // Sidebar Toggle
  document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
    const sidebar = document.getElementById('historySidebar');
    sidebar.classList.toggle('collapsed');
    STATE.isSidebarOpen = !sidebar.classList.contains('collapsed');
  });

  // Audio speed toggle
  document.getElementById('toggleAudioSpeedBtn').addEventListener('click', toggleAudioSpeed);

  // History search filter
  const historySearch = document.getElementById('historySearchInput');
  const clearHistorySearch = document.getElementById('clearHistorySearchBtn');

  historySearch.addEventListener('input', (e) => {
    STATE.historySearchQuery = e.target.value.trim();
    clearHistorySearch.classList.toggle('hidden', STATE.historySearchQuery.length === 0);
    renderHistoryTree();
  });

  clearHistorySearch.addEventListener('click', () => {
    historySearch.value = '';
    STATE.historySearchQuery = '';
    clearHistorySearch.classList.add('hidden');
    renderHistoryTree();
  });

  // Filter Favorites button
  document.getElementById('filterFavoritesBtn').addEventListener('click', function() {
    STATE.favoritesOnly = !STATE.favoritesOnly;
    this.classList.toggle('text-amber-500', STATE.favoritesOnly);
    this.classList.toggle('bg-amber-100', STATE.favoritesOnly);
    renderHistoryTree();
  });

  // Export history button
  document.getElementById('exportHistoryBtn').addEventListener('click', exportHistoryData);

  // Clear all history button
  document.getElementById('clearHistoryBtn').addEventListener('click', clearAllHistory);

  // Sample data button in footer
  document.getElementById('sampleDataBtn').addEventListener('click', () => {
    if (window.SAMPLE_WORDS) {
      STATE.history = [...window.SAMPLE_WORDS];
      saveHistory();
      displayWordDetails(STATE.history[0]);
      showToast('Đã nạp bộ từ mẫu học thuật thành công!', 'success');
    }
  });

  // Theme Toggle Button
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  });

  // Settings Modal Controls
  const settingsModal = document.getElementById('settingsModal');
  document.getElementById('openSettingsBtn').addEventListener('click', () => {
    openSettingsModal();
  });

  document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  document.getElementById('testApiKeyBtn').addEventListener('click', testAPIKeyConnection);

  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const model = document.getElementById('modelSelect').value;
    const accentRadio = document.querySelector('input[name="accentVoice"]:checked');
    const accent = accentRadio ? accentRadio.value : 'en-US';

    STATE.selectedModel = model;
    STATE.defaultVoiceAccent = accent;

    localStorage.setItem(STORAGE_KEYS.MODEL, model);
    localStorage.setItem(STORAGE_KEYS.VOICE_ACCENT, accent);

    settingsModal.classList.add('hidden');
    showToast('Cài đặt đã được lưu thành công!', 'success');

  });

  document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    STATE.selectedModel = 'gemini-3.1-flash-lite';
    STATE.defaultVoiceAccent = 'en-US';

    document.getElementById('modelSelect').value = STATE.selectedModel;
    document.querySelector('input[name="accentVoice"][value="en-US"]').checked = true;

    localStorage.setItem(STORAGE_KEYS.MODEL, 'gemini-3.1-flash-lite');
    localStorage.removeItem(STORAGE_KEYS.VOICE_ACCENT);

    showToast('Đã khôi phục cài đặt mặc định!', 'info');
  });

  // Flashcards Modal Controls
  document.getElementById('openFlashcardBtn').addEventListener('click', openFlashcardModal);
  document.getElementById('closeFlashcardBtn').addEventListener('click', closeFlashcardModal);
  document.getElementById('flashcardCard').addEventListener('click', flipFlashcard);
  document.getElementById('fcNextBtn').addEventListener('click', nextFlashcard);
  document.getElementById('fcPrevBtn').addEventListener('click', prevFlashcard);
  document.getElementById('fcKnowBtn').addEventListener('click', markCardKnown);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Esc closes modals
    if (e.key === 'Escape') {
      settingsModal.classList.add('hidden');
      closeFlashcardModal();
    }
    // Ctrl + K or '/' focuses search
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== wordInput)) {
      e.preventDefault();
      wordInput.focus();
      wordInput.select();
    }
    // Flashcard Space flip / Arrow keys
    if (!document.getElementById('flashcardModal').classList.contains('hidden')) {
      if (e.code === 'Space') {
        e.preventDefault();
        flipFlashcard();
      } else if (e.key === 'ArrowRight') {
        nextFlashcard();
      } else if (e.key === 'ArrowLeft') {
        prevFlashcard();
      }
    }
  });
}

function openSettingsModal() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

async function testAPIKeyConnection() {
  const statusEl = document.getElementById('apiTestStatus');
  const model = document.getElementById('modelSelect').value;

  statusEl.className = 'p-3 rounded-xl text-xs flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  statusEl.innerHTML = '<div class="animate-spin w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full"></div> Đang kiểm tra kết nối với Gemini...';
  statusEl.classList.remove('hidden');

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', model })
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      statusEl.className = 'p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800';
      statusEl.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-500 shrink-0"></i> <span>Kết nối Gemini thành công qua máy chủ (mô hình <b>${escapeHtml(model)}</b>).</span>`;
    } else {
      statusEl.className = 'p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800';
      const error = new Error(result.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.code = result.code;
      statusEl.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 text-rose-500 shrink-0"></i> <span>${escapeHtml(getApiErrorMessage(error))}</span>`;
    }
  } catch (err) {
    statusEl.className = 'p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800';
    statusEl.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 text-rose-500 shrink-0"></i> <span>${escapeHtml(getApiErrorMessage(err))}</span>`;
  }

  initLucide();
}

function getApiErrorMessage(error) {
  if (error.code === 'MISSING_API_KEY') {
    if (window.location.protocol === 'file:') {
      return 'Đừng mở index.html trực tiếp. Chạy start.bat để dùng máy chủ local, hoặc mở website đã deploy trên Netlify.';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'Chưa cấu hình GEMINI_API_KEY trên máy này. Thêm biến môi trường Windows rồi khởi động lại start.bat.';
    }
    return 'Netlify chưa nhận GEMINI_API_KEY: đặt key trong Environment variables cho Production, lưu lại rồi Trigger deploy mới.';
  }

  if (error.status === 502 && /^HTTP 502$/.test(error.message)) {
    return 'Netlify Function trả HTTP 502. Mở Netlify → Functions → Logs để xem lỗi khởi chạy; kiểm tra deploy mới nhất đã dùng Node.js 20.';
  }

  return error.message || 'Lỗi kết nối không xác định.';
}

function setSearchLoading(isLoading) {
  const defaultIcon = document.getElementById('searchIconDefault');
  const spinner = document.getElementById('searchSpinner');
  const submitBtn = document.getElementById('submitBtn');

  if (isLoading) {
    defaultIcon.classList.add('hidden');
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75');
  } else {
    defaultIcon.classList.remove('hidden');
    spinner.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-75');
  }
}

function toggleClearInputBtn(show) {
  const btn = document.getElementById('clearInputBtn');
  if (btn) {
    btn.classList.toggle('hidden', !show);
  }
}

// ==============================================================
// 9. TOAST NOTIFICATIONS & UTILITIES
// ==============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  
  let bgClass = 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';
  let iconName = 'info';

  if (type === 'success') {
    bgClass = 'bg-emerald-600 text-white';
    iconName = 'check-circle';
  } else if (type === 'error') {
    bgClass = 'bg-rose-600 text-white';
    iconName = 'alert-circle';
  } else if (type === 'warning') {
    bgClass = 'bg-amber-600 text-white';
    iconName = 'alert-triangle';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold ${bgClass} animate-fade-in pointer-events-auto transition duration-300`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  initLucide();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
