# Bienvenida y colaboración

El cuadro usa la paleta oscura y verde menta de la aplicación. Comparte HTML, CSS, JavaScript y QR entre Android, Windows, Linux y Chrome/Edge.

Se muestra al primer inicio por perfil. «Saltar» y Escape permiten continuar sin pagar ni esperar; «Colaborar» en el pie lo vuelve a abrir. El estado se guarda localmente, sin telemetría. El cuadro se desplaza en pantallas pequeñas y conserva el orden centrado **QR → Donar → Saltar**.

El QR real codifica `https://monedita.ar/cristalcleariptv`, con margen blanco y corrección de errores M. No se incluye el QR ficticio de la maqueta. El botón abre ese mismo enlace en el navegador externo de Android/Windows/Linux o en una pestaña de Chrome/Edge. Los importes son aportes sugeridos; el proveedor administra sus métodos y límites. No se almacenan credenciales ni datos de pago en la app. Airtm sigue pendiente de un enlace confirmado.

La frase de mantenimiento es un compromiso de mejoras, sin prometer disponibilidad eterna. El aviso breve remite al documento legal existente y no pretende eliminar responsabilidades legales.

## Compilación y prueba

Versión interna 0.2.3 (Android versionCode 5). `Build experimental clients` compila los cambios de la rama y los PR a main. Entrega APK debug, instalador/portable Windows, AppImage Linux, extensión Chrome, extensión Edge y web. Edge y Chrome usan el mismo código Manifest V3; los paquetes se ofrecen separados para identificarlos al descargar. El workflow histórico de release v1.0 no se usa para estos artifacts porque recupera binarios anteriores.

Validar en dispositivo: primer inicio, Saltar sin donar, reapertura desde Colaborar, QR con cámara, pago en navegador externo, regreso a la app, foco de teclado/Escape, scroll en móvil y catálogo/reproducción después de cerrar. Una compilación CI exitosa no certifica un pago real ni reproducción en cada dispositivo.

CI también ejecuta `npm run test:welcome` con Chrome en escritorio, móvil y apaisado: cierre, persistencia, foco, navegación legal, destino de donación, puente Android y almacenamiento bloqueado. Adjunta capturas de cada tamaño. El QR fue decodificado y verificado contra el enlace de Monedita.
