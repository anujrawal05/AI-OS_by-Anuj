// Expand Workspace, strategist consult, & metrics for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';

function updateConversionFunnel(modelData, budgetValue) {
  const trafficEl = document.getElementById('funnel-traffic');
  const qualifiedEl = document.getElementById('funnel-qualified');
  const conversionsEl = document.getElementById('funnel-conversions');
  const growthEl = document.getElementById('funnel-growth');

  const barTraffic = document.getElementById('funnel-bar-traffic');
  const barQualified = document.getElementById('funnel-bar-qualified');
  const barConversions = document.getElementById('funnel-bar-conversions');
  const barGrowth = document.getElementById('funnel-bar-growth');

  const budget = parseFloat(budgetValue) || 0;
  
  let traffic = 1500;
  if (budget > 0) {
    if (budget <= 5000) {
      traffic = 6200;
    } else {
      traffic = 31000;
    }
  }

  let convRate = 0.025;
  if (modelData) {
    const titleLower = modelData.title.toLowerCase();
    if (titleLower.includes('micro-saas')) {
      convRate = 0.018;
    } else if (titleLower.includes('agency')) {
      convRate = 0.032;
    } else if (titleLower.includes('animation') || titleLower.includes('compiler')) {
      convRate = 0.012;
    }
  }

  const qualified = Math.round(traffic * 0.22);
  const conversions = Math.round(traffic * convRate);
  
  let growthPct = "+15%";
  if (budget > 0) {
    if (budget <= 5000) {
      growthPct = "+60%";
    } else {
      growthPct = "+180%";
    }
  }

  if (trafficEl) trafficEl.textContent = traffic.toLocaleString('en-IN');
  if (qualifiedEl) qualifiedEl.textContent = qualified.toLocaleString('en-IN');
  if (conversionsEl) conversionsEl.textContent = `${(convRate * 100).toFixed(1)}% (${conversions.toLocaleString('en-IN')})`;
  if (growthEl) growthEl.textContent = growthPct;

  if (barTraffic) barTraffic.style.setProperty('--w', '100%');
  if (barQualified) barQualified.style.setProperty('--w', '45%');
  if (barConversions) barConversions.style.setProperty('--w', `${Math.min(100, Math.max(10, convRate * 10 * 100))}%`);
  if (barGrowth) {
    barGrowth.style.setProperty('--w', budget === 0 ? '20%' : (budget <= 5000 ? '55%' : '90%'));
  }
}

function loadLiveDashboardMetrics() {
  const loadingEl = document.getElementById('market-data-loading');
  const errorEl = document.getElementById('market-data-error');
  const contentEl = document.getElementById('market-data-content');
  const tbody = document.getElementById('market-data-tbody');
  
  if (!tbody) return;

  try {
    const res = await fetch('/api/market-data');
    if (!res.ok) throw new Error("API call failed");
    const data = await res.json();
    
    tbody.innerHTML = '';
    
    const tickerMappings = {
      'NIFTY': 'NIFTY 50 (NSE)',
      'SENSEX': 'SENSEX (BSE)',
      'NASDAQ': 'NASDAQ Composite',
      'SP500': 'S&P 500 Index',
      'BTC': 'Bitcoin (BTC/USD)',
      'ETH': 'Ethereum (ETH/USD)',
      'Gold': 'Gold COMEX (USD)',
      'USDINR': 'USD / INR Forex'
    };

    Object.entries(data).forEach(([key, val]) => {
      if (!val) return;
      if (!tickerMappings[key]) return;
      const isUp = val.change >= 0;
      const changeClass = isUp ? 'up' : 'down';
      const changeArrow = isUp ? '▲' : '▼';
      const changeSign = isUp ? '+' : '';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600; font-family: var(--font-mono); font-size: 0.82rem;">${tickerMappings[key] || key}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${key === 'USDINR' ? '₹' : (key === 'NIFTY' || key === 'SENSEX' ? '₹' : '$')}${val.price.toLocaleString('en-IN')}</td>
        <td class="change ${changeClass}" style="font-weight: 700; font-family: var(--font-mono); font-size: 0.8rem; color: ${isUp ? 'var(--bus-primary)' : '#ff4a4a'};">
          ${changeArrow} ${changeSign}${val.change}%
        </td>
      `;
      tbody.appendChild(row);
    });

    const valTbody = document.getElementById('valuations-tbody');
    if (valTbody && data._valuations) {
      valTbody.innerHTML = '';
      const focusMappings = {
        'NVDA': 'GPU & Infrastructure',
        'MSFT': 'Copilot & Azure Cloud',
        'AAPL': 'On-Device Intelligence',
        'GOOGL': 'Gemini Ecosystem'
      };
      const nameMappings = {
        'NVDA': 'NVIDIA (NVDA)',
        'MSFT': 'Microsoft (MSFT)',
        'AAPL': 'Apple (AAPL)',
        'GOOGL': 'Alphabet (GOOGL)'
      };
      Object.entries(data._valuations).forEach(([sym, val]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight: 600;">${nameMappings[sym] || sym}</td>
          <td style="font-family: var(--font-mono);">₹${val.capInr}T ($${val.capUsd}T)</td>
          <td><span class="badge-tag" style="background: var(--bus-border); color: var(--bus-primary); border: 1px solid var(--bus-primary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-family: var(--font-mono);">${focusMappings[sym] || 'AI Platform'}</span></td>
        `;
        valTbody.appendChild(row);
      });
    }

    const calList = document.getElementById('calendar-list');
    if (calList && data._calendar) {
      calList.innerHTML = '';
      data._calendar.forEach(evt => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="cal-date-badge" style="background: var(--bus-primary); color: #000; font-weight: 700; font-family: var(--font-mono); font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; min-width: 52px; text-align: center; text-transform: uppercase; line-height: 1.2;">${evt.date}</div>
          <div class="cal-details" style="display: flex; flex-direction: column; gap: 2px; margin-left: 10px;">
            <strong style="color: #fff; font-size: 0.85rem; font-weight: 600;">${evt.title}</strong>
            <span style="color: var(--bus-text-secondary); font-size: 0.75rem;">${evt.desc}</span>
          </div>
        `;
        calList.appendChild(li);
      });
    }

    const trendsCont = document.getElementById('trends-container');
    if (trendsCont && data._trends) {
      trendsCont.innerHTML = '';
      data._trends.forEach((trd, index) => {
        const div = document.createElement('div');
        div.className = 'trend-item';
        if (index > 0) {
          div.style.borderTop = '1px solid var(--bus-border)';
          div.style.paddingTop = '12px';
          div.style.marginTop = '12px';
        }
        div.innerHTML = `
          <div class="trend-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #fff; font-size: 0.85rem; font-weight: 600;">${trd.title}</strong>
            <span class="trend-growth" style="color: var(--bus-primary); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">${trd.growth}</span>
          </div>
          <p class="trend-desc" style="color: var(--bus-text-secondary); font-size: 0.78rem; line-height: 1.4; margin: 0;">${trd.desc}</p>
        `;
        trendsCont.appendChild(div);
      });
    }

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

  } catch (err) {
    console.error("Dashboard live market data load failed:", err.message);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }
}

function loadLiveBusinessNews() {
  const loadingEl = document.getElementById('news-data-loading');
  const errorEl = document.getElementById('news-data-error');
  const contentEl = document.getElementById('news-data-content');
  
  if (!contentEl) return;

  try {
    const res = await fetch('/api/business-news');
    if (!res.ok) throw new Error("API call failed");
    const articles = await res.json();
    
    contentEl.innerHTML = '';
    
    articles.forEach(art => {
      const item = document.createElement('a');
      item.href = art.link;
      item.target = '_blank';
      item.rel = 'noopener';
      item.className = 'news-item';
      item.style.display = 'block';
      item.style.textDecoration = 'none';
      item.style.marginBottom = '12px';
      
      const dateStr = art.pubDate ? new Date(art.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'RECENT';
      
      item.innerHTML = `
        <div class="news-item-title" style="color: #fff; font-weight: 600; font-size: 0.85rem; line-height: 1.4; margin-bottom: 4px; transition: color 0.2s;">
          ${art.title}
        </div>
        <div class="news-item-meta" style="font-size: 0.72rem; color: var(--bus-text-muted); font-family: var(--font-mono); display: flex; gap: 8px;">
          <span>${dateStr}</span>
          <span>•</span>
          <span style="color: var(--bus-primary); font-weight: 600;">${art.source}</span>
        </div>
      `;
      
      item.addEventListener('mouseenter', () => {
        item.querySelector('.news-item-title').style.color = 'var(--bus-primary)';
      });
      item.addEventListener('mouseleave', () => {
        item.querySelector('.news-item-title').style.color = '#fff';
      });

      contentEl.appendChild(item);
    });

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

  } catch (err) {
    console.error("Dashboard news data load failed:", err.message);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }
}

export function initExpandSection() {
  const chatInput = document.getElementById('chat-strategist-input');
  const chatSendBtn = document.getElementById('btn-chat-strategist-send');
  const chatLogs = document.getElementById('chat-strategist-logs');
  const outputPanel = document.getElementById('strategist-tabs-panel');
  const btnAnalyze = document.getElementById('btn-strategist-analyze');
  
  // Strategy tab triggers binding
  const strategTabBtns = document.querySelectorAll('.strategist-tab-btn');
  strategTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-output-tab');
      
      strategTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const panes = document.querySelectorAll('.strategist-tab-pane');
      panes.forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`tab-out-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  let isAnalysisComputed = false;
  let currentBusinessContext = {
    name: '',
    audience: '',
    bottleneck: '',
    strategy: null
  };
  let strategistChatHistory = [];

  if (chatInput && chatSendBtn) {
    const handleChatSend = async () => {
      const text = chatInput.value.trim();
      if (!text) return;
      
      if (!isAnalysisComputed) {
        showToast("Please compile the Enterprise Matrix first.", "warning");
        return;
      }

      chatInput.value = '';
      
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.innerHTML = `<div class="chat-bubble-text">${text}</div>`;
      chatLogs.appendChild(userBubble);
      chatLogs.scrollTop = chatLogs.scrollHeight;

      const typingBubble = document.createElement('div');
      typingBubble.className = 'chat-bubble assistant typing';
      typingBubble.innerHTML = `<div class="chat-bubble-text">⏳ Consultant is typing...</div>`;
      chatLogs.appendChild(typingBubble);
      chatLogs.scrollTop = chatLogs.scrollHeight;

      try {
        const res = await fetch('/api/strategist/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'chat',
            businessName: currentBusinessContext.name,
            userInput: text,
            history: strategistChatHistory
          })
        });
        const data = await res.json();
        
        typingBubble.remove();
        
        if (!res.ok) throw new Error(data.error || "Consultation request failed.");

        strategistChatHistory.push({ role: 'user', content: text });
        strategistChatHistory.push({ role: 'assistant', content: data.reply });

        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-bubble assistant';
        replyBubble.innerHTML = `<div class="chat-bubble-text">${data.reply}</div>`;
        chatLogs.appendChild(replyBubble);
        chatLogs.scrollTop = chatLogs.scrollHeight;

      } catch (err) {
        typingBubble.remove();
        showToast(err.message || "Consultation connection failed.", "error");
      }
    };

    chatSendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });
  }

  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', async () => {
      const nameEl = document.getElementById('in-bus-name');
      const audienceEl = document.getElementById('in-bus-audience');
      const bottleneckEl = document.getElementById('in-bus-bottleneck');
      
      const name = nameEl ? nameEl.value.trim() : '';
      const audience = audienceEl ? audienceEl.value.trim() : '';
      const bottleneck = bottleneckEl ? bottleneckEl.value.trim() : '';

      if (!name || !audience || !bottleneck) {
        showToast("Please answer all operational queries first.", "warning");
        return;
      }

      btnAnalyze.disabled = true;
      btnAnalyze.textContent = "COMPILING MATRIX DIAGNOSTICS...";

      try {
        const res = await fetch('/api/strategist/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'compile',
            businessName: name,
            targetAudience: audience,
            primaryBottleneck: bottleneck
          })
        });
        const data = await res.json();
        
        btnAnalyze.disabled = false;
        btnAnalyze.textContent = "Re-Compile Matrix";
        
        if (!res.ok) throw new Error(data.error || "Failed to compile business strategy.");

        isAnalysisComputed = true;
        currentBusinessContext = { name, audience, bottleneck, strategy: data };
        strategistChatHistory = [
          { role: 'user', content: `Compile strategy for ${name} selling to ${audience} with bottleneck ${bottleneck}` },
          { role: 'assistant', content: `Analysis Compiled successfully. I have populated the 7-tab Strategy Board. Key findings:
${data.analysis}` }
        ];

        if (chatLogs) {
          chatLogs.innerHTML = '';
          const welcomeBubble = document.createElement('div');
          welcomeBubble.className = 'chat-bubble assistant';
          welcomeBubble.innerHTML = `<strong>Enterprise Analysis Compiled!</strong><br>I have generated a customized operational blueprint based on your query. Please review the <strong>7-tab Strategy Board</strong> below.<br><br>You can now ask follow-up questions in the chat bar below.`;
          chatLogs.appendChild(welcomeBubble);
        }

        const keys = ['analysis', 'opportunities', 'automation', 'marketing', 'leads', 'revenue', 'plan'];
        keys.forEach(k => {
          const tabPane = document.getElementById(`tab-out-${k}`);
          if (tabPane && data[k]) {
            tabPane.innerHTML = `<p>${data[k]}</p>`;
          }
        });

        if (outputPanel) outputPanel.style.display = 'block';
        showToast("Strategic analysis matrix compiled successfully!");

      } catch (err) {
        btnAnalyze.disabled = false;
        btnAnalyze.textContent = "Compile Strategic Matrix";
        showToast(err.message || "Failed to compile blueprint.", "error");
      }
    });
  }

  // Populate news and market metrics dynamically on load
  loadLiveDashboardMetrics();
  loadLiveBusinessNews();
}

// Global exposure for backwards compatibility
window.updateConversionFunnel = updateConversionFunnel;
window.loadLiveDashboardMetrics = loadLiveDashboardMetrics;
window.loadLiveBusinessNews = loadLiveBusinessNews;
window.initExpandSection = initExpandSection;
