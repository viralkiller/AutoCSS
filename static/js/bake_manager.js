(function () {
  'use strict';
  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;

  const BakeManager = {
    // --- EXPORT SYSTEM ---
    async generateFinalCode() {
      L.log('[BakeManager] generating final code...');

      // 1. Clone the current document to manipulate safely
      const clone = document.documentElement.cloneNode(true);

      // 2. Remove Editor/Simulator UI artifacts
      const findAll = (sel) => clone.querySelectorAll(sel);

      // Remove Editor controls and the Bake UI itself
      findAll('.controls, .back-home-btn, #exit-live-btn, #get-code-btn, #rotateGate, #code-modal-overlay').forEach(el => el.remove());

      // 3. Unwrap the simulator-wrapper and device-frame
      const frame = clone.querySelector('#device-frame');
      if (frame) {
        // Move all children of frame to body
        while (frame.firstChild) {
          clone.querySelector('body').appendChild(frame.firstChild);
        }
        // Remove the wrapper structure
        const wrapper = clone.querySelector('.simulator-wrapper');
        if (wrapper) wrapper.remove();

        // Reset body styles for standalone page
        const body = clone.querySelector('body');
        body.style.padding = '0';
        body.style.overflowY = 'auto';
        body.style.display = 'block';
        body.classList.remove('view-live');
      }

      // 4. Inline CSS (Fetch local CSS and inject into <style> tags)
      const links = findAll('link[rel="stylesheet"]');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/static/')) {
          try {
            const res = await fetch(href);
            const cssText = await res.text();
            const style = document.createElement('style');
            style.textContent = `\n/* Inlined from ${href} */\n${cssText}\n`;
            link.replaceWith(style);
          } catch (e) {
            console.warn('Failed to inline CSS:', href);
          }
        }
      }

      // 5. Inline JS
      const scripts = findAll('script[src]');
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src && src.startsWith('/static/')) {
          // Skip simulator.js & bake_manager.js - the final page doesn't need the editor tools
          if (src.includes('simulator.js') || src.includes('bake_manager.js')) {
            script.remove();
            continue;
          }
          try {
            const res = await fetch(src);
            const jsText = await res.text();
            const newScript = document.createElement('script');
            newScript.textContent = `\n// Inlined from ${src}\n${jsText}\n`;
            script.replaceWith(newScript);
          } catch (e) {
            console.warn('Failed to inline JS:', src);
          }
        }
      }

      // 6. Serialize
      return "<!DOCTYPE html>\n" + clone.outerHTML;
    },

    async openExportModal() {
      // Create Modal DOM if not exists
      let modal = document.getElementById('code-modal-overlay');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'code-modal-overlay';
        modal.className = 'code-modal-overlay';
        modal.innerHTML = `
          <div class="code-modal-content">
            <div class="code-modal-header">
              <span class="code-modal-title">FINAL BAKED HTML</span>
              <span style="font-size:12px; color:#666;">(HTML/CSS/JS Bundled)</span>
            </div>
            <div class="code-modal-body">
              <textarea id="final-code-area" class="code-textarea" readonly>Generating...</textarea>
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

      const textArea = document.getElementById('final-code-area');
      textArea.value = "Bundling assets... please wait.";

      const code = await this.generateFinalCode();
      textArea.value = code;
    },

    closeExportModal() {
      const modal = document.getElementById('code-modal-overlay');
      if (modal) modal.style.display = 'none';
    },

    copyCode() {
      const textArea = document.getElementById('final-code-area');
      if (!textArea) return;
      textArea.select();
      document.execCommand('copy');
      const btn = document.querySelector('.cm-btn-copy');
      const originalText = btn.textContent;
      btn.textContent = "COPIED!";
      setTimeout(() => btn.textContent = originalText, 2000);
    }
  };

  window.Demeza.BakeManager = BakeManager;
  // Global hook for the button
  window.openExportModal = () => BakeManager.openExportModal();

})();