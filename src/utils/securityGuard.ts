/**
 * Hardening de Segurança no Frontend & Anti-Inspeção (DevTools Shield)
 * Protege a interface contra engenharia reversa e inspeção não autorizada.
 */

export function initSecurityGuard() {
  if (typeof window === 'undefined') return;

  // 1. Bloqueio de Clique com o Botão Direito (Menu de Contexto)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Bloqueio de Teclas de Atalho de Inspeção e Engenharia Reversa
  window.addEventListener('keydown', (e) => {
    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspecionar)
    // Ctrl+Shift+J / Cmd+Opt+J (Console)
    // Ctrl+Shift+C / Cmd+Opt+C (Inspecionar Elemento)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (
      e.key === 'I' || e.key === 'i' ||
      e.key === 'J' || e.key === 'j' ||
      e.key === 'C' || e.key === 'c'
    )) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Opt+U (Exibir Código Fonte da Página)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Salvar página completa)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Supressão de Logs no Console para Evitar Exposição de Dados
  try {
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
  } catch {
    // ignore
  }

  // 4. Anti-Debugging Trap (Dificulta inspeção via menu do navegador)
  setInterval(() => {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    (function() { return false; })['constructor']('debugger')();
    const duration = performance.now() - start;
    if (duration > 100) {
      // Se o debugger pausou a execução (DevTools aberto)
      try {
        console.clear();
      } catch {
        // ignore
      }
    }
  }, 1500);
}
