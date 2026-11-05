// No pago, registro ni temporizador son necesarios para continuar.
const isAndroidTv = new URLSearchParams(location.search).get('device') === 'tv';
if (isAndroidTv) document.documentElement.classList.add('android-tv');
const dialog = document.getElementById('welcome');
const opener = document.getElementById('showWelcome');
const status = document.getElementById('donationStatus');
let previousFocus;
function openWelcome() {
 if (dialog.open) return;
 previousFocus = document.activeElement;
 dialog.showModal();
 dialog.scrollTop = 0;
 (isAndroidTv ? document.getElementById('skipWelcome') : document.getElementById('welcomeTitle')).focus({preventScroll:true});
 document.documentElement.classList.add('welcome-open');
}
function closeWelcome() { dialog.close(); }
dialog.addEventListener('close', () => {
 document.documentElement.classList.remove('welcome-open');
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
// Cada creación de la interfaz corresponde a un nuevo arranque de la app.
// No se consulta ni se guarda un indicador «ya visto» de versiones anteriores.
// Volver del navegador de donaciones no recarga la WebView ni abre otro cuadro.
openWelcome();
