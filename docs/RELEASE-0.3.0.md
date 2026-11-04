## CristalClear IPTV 0.3.0

Versión con EPG en grilla, orden de canales adaptado y bienvenida con QR de Monedita en cada inicio.

- **Guía de programación:** grilla de seis horas, fecha, «Ahora», filtros, detalle de programas y apertura del canal en vivo.
- **EPG actualizable:** fuentes XMLTV públicas, caché local y copia reciente incluida. Los canales sin cobertura muestran «Sin información».
- **Orden inspirado en Flow:** variantes consecutivas, sustitutos identificados como «Similar a…» y canales adicionales al final. Numeración propia; no se presenta como copia certificada de una grilla local de Flow.
- **Colaboraciones opcionales:** QR y enlace de Monedita, con «Donar» y «Saltar». Sin publicidad.

### Descargas

Android APK, Windows instalador/portable (ZIP), Linux AppImage (ZIP), extensión Chrome y extensión Edge (ZIP). Las extensiones incluyen `manifest.json` en la raíz. `SHA256SUMS.txt` permite comprobar la integridad de las descargas.

Estos son los mismos binarios del [workflow de pruebas 41764242946](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/runs/41764242946), commit `aaa36c478866a3d7928bdf4d70d4f5deb2dc9e9c`, integrado a main mediante el PR #6. No se recompilaron para esta publicación. Versión interna **0.3.0**, Android **versionCode 7**; el APK conserva la firma debug de la compilación probada.

### Validación y alcance

27 pruebas unitarias, pruebas de interfaz móvil/escritorio y compilaciones multiplataforma correctas. El autor del proyecto confirmó el funcionamiento de Android. Windows, Linux y extensiones tienen validación de compilación/CI; la compatibilidad con cada dispositivo y stream requiere prueba manual.

La copia de EPG de esa compilación contiene 2.094 programas para 36 identificadores. La cobertura es parcial y puede variar según las fuentes. No se ofrecen grabación, catch-up ni reproducción de programas futuros. Las emisiones pertenecen a sus respectivos titulares; se mantiene el aviso legal de la aplicación.
