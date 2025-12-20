(function () {
  'use strict';
  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;

  const BakeManager = {
    // Files to explicitly exclude from the final baked HTML
    blocklist: [
      'simulator.js',     // Editor tools
      'bake_manager.js',  // The baker itself
      'index.js',         // Index page logic
      'index_boot.js',
      'ua-parser.min.js'  // Optional: keep if needed, but often bloat
    ],

    async generateFinalCode() {
      L.log('[BakeManager] Starting generation sequence...');

      // 1. Clone the current page state
      const clone = document.documentElement.cloneNode(true);
      const body = clone.querySelector('body');

      // 2. Extract and Unwrap Device Frame
      const wrapper = clone.querySelector('.simulator-wrapper');
      const frame = clone.querySelector('#device-frame');

      if (wrapper && frame) {
        L.log('[BakeManager] Unwrapping #device-frame from simulator');
        // Move frame to root of body
        body.insertBefore(frame, wrapper);
        wrapper.remove();

        // 3. Clean Frame Styles for Production
        frame.style.cssText = ""; // Clear all simulator-injected inline styles
        frame.style.width = '100%';
        frame.style.minHeight = '100vh';
        frame.style.border = 'none';
        frame.style.boxShadow = 'none';
        frame.style.resize = 'none'; // Critical: remove resize handle
      }

      // 4. Identify and Remove Editor Elements
      const removables = [
        '.controls',
        '.back-home-btn',
        '#exit-live-btn',
        '#get-code-btn',
        '#code-modal-overlay',
        '.workspace-hint',      // Remove editor-only hints
        'script[src*="reload"]' // Generic live-reload
      ];

      removables.forEach(sel => {
        const els = clone.querySelectorAll(sel);
        L.log(`[BakeManager] Removing editor element: ${sel} (${els.length} found)`);
        els.forEach(el => el.remove());
      });

      // 5. Production Class Injection
      body.classList.remove('rotate-blocked'); // Ensure state is clean
      body.classList.add('view-live');
      body.classList.add('is-native-mobile');
      body.style.padding = '0';
      body.style.margin = '0';

      // 6. Inline CSS Assets
      const links = clone.querySelectorAll('link[rel="stylesheet"]');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/static/') || href.startsWith('static/'))) {
          try {
            L.log(`[BakeManager] Inlining CSS: ${href}`);
            const res = await fetch(href);
            let cssText = await res.text();

            const style = document.createElement('style');
            style.textContent = `\n/* Inlined: ${href} */\n${cssText}\n`;
            link.replaceWith(style);
          } catch (e) {
            L.err(`[BakeManager] CSS Inlining failed: ${href}`, e);
          }
        }
      }

      // 7. Inline JS Assets
      const scripts = clone.querySelectorAll('script[src]');
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (!src) continue;

        const isLocal = src.startsWith('/static/') || src.startsWith('static/');
        const isBlocked = this.blocklist.some(blocked => src.includes(blocked));

        if (isBlocked) {
          L.log(`[BakeManager] Blocking script: ${src}`);
          script.remove();
          continue;
        }

        if (isLocal) {
          try {
            L.log(`[BakeManager] Inlining JS: ${src}`);
            const res = await fetch(src);
            const jsText = await res.text();
            const newScript = document.createElement('script');
            newScript.textContent = `\n// Inlined: ${src}\n${jsText}\n`;
            script.replaceWith(newScript);
          } catch (e) {
            L.err(`[BakeManager] JS Inlining failed: ${src}`, e);
          }
        }
      }

      L.log('[BakeManager] Generation complete.');
      return "<!DOCTYPE html>\n" + clone.outerHTML;
    },

    async openExportModal() {
      let modal = document.getElementById('code-modal-overlay');
      if (!modal) {
        L.log('[BakeManager] Creating export modal UI');
        modal = document.createElement('div');
        modal.id = 'code-modal-overlay';
        modal.className = 'code-modal-overlay';
        modal.innerHTML = `
          <div class="code-modal-content">
            <div class="code-modal-header">
              <span class="code-modal-title">FINAL BAKED HTML</span>
              <span style="font-size:12px; color:#666;">(Single File • Standalone)</span>
            </div>
            <div class="code-modal-body">
              <textarea id="final-code-area" class="code-textarea" readonly>Bundling assets...</textarea>
            </div>
            <div class="code-modal-footer">
              <button class="cm-btn cm-btn-close" onclick="window.Demeza.BakeManager.closeExportModal()">CLOSE</button>
              <button class="cm-btn cm-btn-copy" onclick="window.Demeza.BakeManager.copyCode()">COPY CODE</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      modal.style.display = 'flex';
      L.log('[UI] Modal opened');

      const code = await this.generateFinalCode();
      const textArea = document.getElementById('final-code-area');
      if (textArea) textArea.value = code;
    },

    closeExportModal() {
      const modal = document.getElementById('code-modal-overlay');
      if (modal) {
        modal.style.display = 'none';
        L.log('[UI] Modal closed');
      }
    },

    copyCode() {
      const textArea = document.getElementById('final-code-area');
      if (!textArea) return;
      textArea.select();
      document.execCommand('copy');

      const btn = document.querySelector('.cm-btn-copy');
      const originalText = btn.textContent;
      btn.textContent = "COPIED!";
      L.log('[UI] Code copied to clipboard');
      setTimeout(() => btn.textContent = originalText, 2000);
    }
  };

  window.Demeza.BakeManager = BakeManager;
  window.openExportModal = () => BakeManager.openExportModal();
})();