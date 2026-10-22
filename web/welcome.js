// No pago, registro ni temporizador son necesarios para continuar.
const dialog = document.getElementById('welcome');
const opener = document.getElementById('showWelcome');
const status = document.getElementById('donationStatus');
const seenKey = 'cristal.welcome.v1';
let previousFocus;
function openWelcome() {
 if (dialog.open) return;
 previousFocus = document.activeElement;
 dialog.showModal();
 dialog.scrollTop = 0;
 document.getElementById('welcomeTitle').focus({preventScroll:true});
 document.documentElement.classList.add('welcome-open');
}
function closeWelcome() { dialog.close(); }
dialog.addEventListener('close', () => {
 document.documentElement.classList.remove('welcome-open');
 try { localStorage.setItem(seenKey, 'seen'); } catch { /* Navegación privada. */ }
 if (previousFocus instanceof HTMLElement) previousFocus.focus();
});
document.getElementById('skipWelcome').addEventListener('click', closeWelcome);
opener.addEventListener('click', openWelcome);
document.getElementById('donate').addEventListener('click', event => {
 if (typeof window.AndroidPlayer?.openDonation !== 'function') return;
 event.preventDefault();
 try { window.AndroidPlayer.openDonation(); }
 catch { status.hidden = false; status.textContent = 'No se pudo abrir el navegador. Podés escanear el QR o usar el enlace de Monedita.'; }
});
let seen = false;
try { seen = localStorage.getItem(seenKey) === 'seen'; } catch { /* Mostrar sin almacenamiento. */ }
if (!seen) openWelcome();
