# Cristal Clear Xuper IPTV

[![Build experimental clients](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/workflows/build.yml/badge.svg)](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/workflows/build.yml)

Alternativa independiente de código abierto inspirada en aplicaciones populares de streaming, con listas IPTV públicas en español y guía XMLTV. No aloja ni controla las emisiones de terceros. El contenido se reproduce desde sus proveedores y está sujeto a sus derechos y condiciones.

La idea es que sea para el pueblo, de licencia abierta y sin publicidad (a base de donativos si te copas por el tiempo dedicado y el esfuerzo para que puedas disfrutarlo, pero tampoco es obligatorio 😉 ).

**Versión de distribución v1.0.0 (artifacts del Workflow #13, compilados con versión interna 0.2.2).** Proyecto propio: el ZIP de referencia era una extensión Chromium compilada, sin fuentes de desarrollo ni licencia en la raíz. No se copiaron sus bundles, imágenes o marcas, por lo que este repositorio no se presenta como fork de aplicaciones comerciales.

##
## DISCLAIMER / AVISO:

Cristal Clear Xuper IPTV es una aplicación independiente de reproducción y visualización de contenido multimedia mediante tecnologías de transmisión por Internet, incluyendo IPTV, HTTP Live Streaming (HLS) y otros protocolos compatibles.

El proyecto se desarrolla y distribuye como una herramienta tecnológica destinada a facilitar la reproducción de fuentes multimedia disponibles a través de Internet.

La aplicación no constituye por sí misma un servicio de televisión, una plataforma de distribución audiovisual ni una empresa proveedora de señales televisivas.

Todos los derechos de autor, derechos conexos, marcas comerciales, logotipos, nombres de canales, producciones cinematográficas, series, programas televisivos, transmisiones deportivas, obras musicales y demás contenidos audiovisuales pertenecen exclusivamente a sus respectivos titulares legítimos.

Cristal Clear Xuper IPTV y su desarrollador no reivindican propiedad, autoría, licencia ni derechos de explotación sobre contenidos multimedia de terceros.

La inclusión o visualización de nombres, logotipos, identificadores, enlaces o metadatos de canales no implica titularidad, patrocinio, autorización, asociación comercial ni vínculo contractual con sus propietarios.
##
## Privacidad y permisos — Android

Cristal Clear Xuper IPTV para Android está diseñada para funcionar sin solicitar permisos invasivos o ajenos a su finalidad.

La aplicación no requiere acceso a la cámara, ubicación, contactos, llamadas telefónicas ni mensajes SMS, y no solicita permisos para enviar mensajes o realizar llamadas.

Únicamente utiliza las capacidades necesarias para conectarse a Internet y reproducir contenido multimedia.

Respetamos la privacidad del usuario: la aplicación no necesita acceder a información personal sensible del dispositivo para funcionar.


## Privacidad y permisos — Extensión Chrome / Microsoft Edge

Cristal Clear Xuper IPTV para Google Chrome y Microsoft Edge está diseñada para respetar la privacidad del usuario y funcionar sin solicitar permisos invasivos o innecesarios.

La extensión no requiere acceso a archivos personales, dirección MAC, ubicación geográfica, historial de navegación, información detallada del sistema operativo, características del hardware ni recursos del equipo ajenos a su funcionamiento.

Tampoco está diseñada para recopilar identificadores del dispositivo, elaborar perfiles de usuario ni realizar seguimiento de su actividad.

Los permisos de red se utilizan exclusivamente para consultar listas IPTV, obtener información de programación (EPG) y reproducir contenido multimedia desde servidores externos.

Compromiso de privacidad: Cristal Clear Xuper IPTV no necesita recopilar datos personales ni monitorear la actividad del usuario para ofrecer sus funcionalidades.

Nota: los servidores externos pueden recibir información técnica habitual de las conexiones, como la dirección IP pública y datos del navegador. Estas comunicaciones están sujetas a las políticas de los respectivos proveedores de contenido.

### Privacidad, permisos y seguridad — Windows (Portable e Instalable)

**Cristal Clear Xuper IPTV para Windows**, tanto en su versión **Portable** como **Instalable**, está diseñado para funcionar sin requerir permisos invasivos ni acceder a información personal ajena a sus funcionalidades.

La aplicación no necesita acceder a **archivos personales, dirección MAC, ubicación geográfica, historial de navegación, información detallada del sistema operativo ni identificadores únicos del equipo**.

Tampoco está diseñada para recopilar direcciones IP con fines de seguimiento, realizar análisis de comportamiento, elaborar perfiles de usuario ni monitorear la actividad del dispositivo.

La conexión a Internet se utiliza para actualizar listas IPTV, consultar guías de programación (EPG) y reproducir contenido multimedia desde servidores externos. Estos servidores pueden recibir información técnica habitual de las conexiones, como la dirección IP pública.

**Compromiso de privacidad:** Cristal Clear Xuper IPTV no requiere recopilar información personal sensible ni supervisar la actividad del usuario para funcionar.

### Seguridad — VirusTotal

Para facilitar la transparencia y permitir la verificación independiente de los ejecutables distribuidos, se proporcionan los siguientes análisis de seguridad:

- **Windows Portable:** [Consultar análisis en VirusTotal](https://www.virustotal.com/gui/file/81d99134294f1daef63889fa3e45a6ead880bd6a126693da2c849a5906baf1ab?nocache=1)
- **Windows Instalable:** [Consultar análisis en VirusTotal](https://www.virustotal.com/gui/file/d94f982b13ab820cfce7967a5584569387b362d0849df3bb501333c1ba009b4e?nocache=1)

Los análisis corresponden a los archivos identificados por sus respectivos hashes SHA-256. Cualquier modificación o nueva compilación genera un archivo diferente que requiere una nueva verificación.

**Importante:** VirusTotal es una herramienta de análisis mediante múltiples motores de seguridad. Sus resultados no constituyen una certificación de seguridad absoluta ni garantizan la ausencia de vulnerabilidades.

## Descargas v1.0.0

[Release v1.0.0](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/releases/tag/v1.0.0) · [Workflow #13 (origen de los cuatro artifacts)](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/runs/39718101706).

Los cuatro paquetes de la release corresponden exactamente a los artifacts de la ejecución #13: Windows (instalador y portable), Linux (AppImage), Android (APK debug) y extensión Chrome/Edge (ZIP). **Los binarios de #13 aún informan versión interna 0.2.2**; v1.0.0 es la etiqueta de distribución. No son binarios recompilados con numeración interna 1.0 ni están firmados. El workflow completó exitosamente; la compatibilidad con cada stream y dispositivo requiere pruebas manuales.

## Interfaz y motores

El catálogo combinado usa `spa.m3u` y `movies.m3u`, deduplica URLs y prioriza Argentina, deportes y películas. La interfaz oculta el reproductor hasta elegir una señal, permite volver al catálogo, dispone de botón flotante para regresar arriba y oculta las opciones manuales de XMLTV. La guía incluida es parcial; **la grilla EPG unificada completa sigue pendiente**.

En web, Chrome/Edge, Windows y Linux se ofrecen HTML5, HLS.js y Video.js (archivos locales). En Android se utiliza Media3 nativo. La disponibilidad real depende de CORS, códecs y de cada origen. La selección de Video.js no garantiza compatibilidad con DASH u otros formatos.

## Funciones

- Catálogo completo de la lista oficial por idioma español de iptv-org, con filtros combinables por país de origen y categoría.
- Combina la lista de idioma español con la categoría pública de películas; elimina URLs duplicadas.
- Incluye canales hispanohablantes de España, Latinoamérica y otros países. Portugués y otros idiomas quedan fuera. País de origen no significa disponibilidad territorial.
- Buscador sin tildes, favoritos locales, paginación, copias de respaldo y actualización de listas.
- Reproductor HLS, pantalla completa y selector de variantes cuando la señal las ofrece.
- Guía XMLTV: programa actual y próximo, importación de archivo o URL, vinculación por `tvg-id`, base sin ambigüedad o equivalencia explícita y horas en la zona local. Muestra «Sin Informar» cuando faltan datos.
- Extensión Chrome/Edge, escritorio Electron Windows/Linux y proyecto Android con reproductor Media3 nativo, launcher móvil y Android TV.

La clasificación lingüística depende de los índices públicos, no de un análisis de audio. Una URL puede cambiar de contenido o emitir programas en otro idioma. No se garantiza que toda emisión sea correcta o esté disponible.

## Extensión Chrome / Edge

Descargar el artifact **`cristal-clear-extension-chrome`** de la última ejecución del workflow. Extraer el ZIP en una carpeta. El archivo **`manifest.json` queda directamente en la raíz**, junto a `background.js`, `index.html` e `INSTALAR-CHROME.txt`.

Abrir `chrome://extensions` o `edge://extensions`, activar Modo de desarrollador y **Cargar descomprimida** → elegir la carpeta recién extraída. No hace falta buscar subcarpetas `web` o `build`. Pulsar el icono para abrir el cliente.

La web se entrega por separado como **`cristal-clear-web`**. Los artifacts antiguos llamados `cristal-clear-web-extension` mezclaban ambos destinos; reemplazarlos por la nueva descarga de extensión.

Para desarrollar desde el código fuente: `node scripts/prepare.mjs` genera `build/extension/`. `node scripts/check-extension.mjs` comprueba el manifiesto y sus archivos antes de publicar. Es una extensión de navegador, no un addon Kodi.


## Windows y Linux

Requisitos: Node.js 22+, Windows 10/11 x64 o Linux moderno. No soporta Windows 7 ni 32 bits.

```sh
npm ci
npm test
npm run prepare:targets
npm start
npm run build:windows
# O en Linux:
npm run build:linux
```

Windows genera NSIS y portable; Linux genera AppImage. El workflow `Build experimental clients` compila en cada SO y entrega artifacts. Los binarios de prueba no están firmados con certificado de distribución. La generación y las pruebas de un instalador se informan por separado de las pruebas de reproducción.

## Android: móvil, box y TV

Abrir `android/` en Android Studio: JDK 17, SDK 35, Gradle 8.11.1. También se puede ejecutar:

```sh
npm run prepare:targets
cd android
gradle assembleDebug
```

APK de prueba: `android/app/build/outputs/apk/debug/app-debug.apk`. Android mínimo 6.0 (API 23), WebView actualizado. Flechas/Enter para navegar, controles Media3 para reproducir, Atrás para volver. El video se pausa al salir a segundo plano. La compatibilidad con controles remotos y códecs debe comprobarse en dispositivos. Permite HTTP para fuentes públicas antiguas; no introducir credenciales en esas listas.

La compilación local encontró un bloqueo de acceso de Gradle a Maven. La compilación remota de GitHub Actions sí generó la APK debug correctamente; aún falta probarla en dispositivos físicos.

## Guía XMLTV de iptv-org/epg

[iptv-org/epg](https://github.com/iptv-org/epg) proporciona herramientas de generación, no una única URL oficial universal de guía. Sus servidores comunitarios publicados aparecían sin guías disponibles al revisar el proyecto el 21/10/2026. Este cliente no inventa programas ni incluye un enlace universal supuesto.

La copia inicial `web/data/guide.xml`, generada el 21/10/2026 con iptv-org/epg, contiene 238 programas de 10 señales; otros 2 canales consultados no devolvieron programas. Es una instantánea parcial, no una guía universal ni un servicio actualizado en tiempo real. Cuando no hay programa vigente se muestra «Sin Informar».

`epg/channels.xml` selecciona candidatos reales en español por coincidencia exacta de ID del catálogo. La selección prioriza fuentes como mi.tv, reportv y otras disponibles; que un canal tenga un candidato no garantiza que el proveedor devuelva programas.

Para generar una guía, ejecutar manualmente el workflow **Generate Spanish XMLTV**. Descargar el artifact `cristal-clear-xmltv`, importar `guide.xml` en el cliente, o alojarlo con CORS y configurar su URL. También puede copiarse a `web/data/guide.xml` antes de compilar para que se cargue automáticamente. No existe un servicio propio de EPG alojado por este proyecto ni se promete cobertura de todos los canales.

Generación local:

```sh
git clone --depth 1 https://github.com/iptv-org/epg.git epg-tools
cd epg-tools
npm ci
cd ..
node scripts/catalog-report.mjs
python3 scripts/epg-channels.py --epg-root epg-tools
cd epg-tools
npm run grab -- --channels=../epg/channels.xml --lang=es --days=2 --maxConnections=2 --output=../web/data/guide.xml
```

No se descarga programación para IDs ajenos al catálogo español. No hay búsqueda aproximada por nombre. Desde 0.2.1 se admiten IDs base únicamente cuando hay un solo feed permitido y equivalencias explícitas comprobadas por fuente; las variantes ambiguas quedan sin asociación. Se elimina sin resolver la declaración convencional de xmltv.dtd; se rechazan otras DTD y entidades externas. La importación admite XML y XML.GZ, con límite de 40 MB tanto antes como después de descomprimir. Las fuentes se combinan: la última cargada tiene prioridad si hay programas simultáneos y las anteriores completan los huecos.

## Fuentes, categorías y actualización

- [Listas de iptv-org](https://github.com/iptv-org/iptv/blob/master/PLAYLISTS.md).
- Lista de inclusión: https://iptv-org.github.io/iptv/languages/spa.m3u
- Películas: https://iptv-org.github.io/iptv/categories/movies.m3u
- País/categoría e idioma de feed: [API oficial](https://github.com/iptv-org/api).

La lista de idioma reúne las señales españolas que también aparecen en listas por país y categoría; no se cargan cientos de listas redundantes ni se incorpora una categoría internacional entera con sus canales ingleses. `web/data/catalog-report.json` contiene los recuentos fechados. La fuente «Películas» corresponde a televisión en vivo, no VOD.

Al abrir o actualizar, el cliente descarga español y películas. Si fallan, usa caché y después las copias incluidas, informándolo en pantalla. Los metadatos se distribuyen con cada compilación. Para refrescar listas y metadatos de la fuente de código:

```sh
npm run catalog:update
npm run prepare:targets
```

El script necesita Python 3, curl y Node.js. Actualiza el reporte y los IDs de EPG; volver a seleccionar los candidatos EPG después de actualizar.

## Límites técnicos

Web, extensión y Electron dependen de CORS, HTTP/HTTPS y códecs soportados. No se desactivan esas protecciones. Media3 evita la capa de reproducción WebView, pero no evita geobloqueos, permisos ni enlaces caídos. La calidad depende de las variantes existentes; no hay transcodificación para fabricar resoluciones o reducir una fuente de variante única. No hay DRM, Chromecast ni PiP.

## Aviso legal

El proyecto no aloja, produce ni controla emisiones de terceros. Los enlaces públicos y las licencias de software no otorgan derechos sobre el contenido audiovisual. Cada usuario debe respetar los derechos y condiciones aplicables.

En la máxima medida permitida por la legislación aplicable, el software se ofrece «tal cual» y sus autores no asumen responsabilidad por contenido de terceros ni daños derivados del uso de enlaces externos. Esta cláusula no excluye responsabilidades que legalmente no puedan limitarse y no constituye inmunidad legal absoluta.

Leer [DISCLAIMER.md](DISCLAIMER.md) para el aviso completo y el procedimiento de reporte. También está disponible dentro del cliente. No existe afiliación con aplicaciones comerciales ni con sus titulares.

Código propio: [MIT](LICENSE). HLS.js conserva su licencia BSD-2-Clause en `web/vendor/HLS-LICENSE`; los datos de iptv-org conservan su licencia en `web/data/IPTV-LICENSE`. Las emisiones conservan sus derechos originales.

## Fuentes EPG adicionales · 0.2.1

Se revisaron los enlaces propuestos y se agregaron seis fuentes seleccionables: TDTChannels, Open EPG Argentina/España/México/Perú y EPGShare España. Se comprobó respuesta HTTP y contenido XMLTV el 21/10/2026; no es una garantía de actualizaciones futuras. No se descargan todas automáticamente ni se agregan los canales ingleses de las guías. El catálogo español sigue siendo la lista de inclusión.

Hay 31 equivalencias explícitas de IDs. El resto solo se vincula por ID exacto o base única; los canales sin programa vigente muestran «Sin Informar». Para importar un archivo con IDs propios de un proveedor, elegir antes su nombre en **Configurar XMLTV → Fuentes comprobadas**.

La web y Android WebView pueden bloquear URLs sin CORS. En ese caso descargar el archivo desde el proveedor e importarlo, o servirlo con los encabezados CORS correspondientes. La extensión solicita acceso a los tres dominios específicos de estas guías.

[Revisión de las tres fuentes propuestas y resultados](docs/EPG-SOURCES.md). Free-TV Argentina aporta un catálogo e identificadores, no programación horaria. El addon Flow consulta una API con autenticación y requiere suscripción; no se copiaron su código, recursos de marca ni datos de cuentas. Su licencia de código no equivale a permiso sobre la programación de la plataforma.

## Bienvenida y colaboraciones

Cuadro opcional con aviso breve de derechos de terceros, diseño oscuro y verde menta, y aportes sugeridos desde ARS 500 por Mercado Pago o USD 10 por PayPal. QR centrado, botón **Donar** y botón **Saltar**, en ese orden. Disponible en Android, Windows, Linux y extensiones Chrome/Edge; vuelve a abrirse desde **Colaborar**. [Colaborar en Monedita](https://monedita.ar/cristalcleariptv). [Funcionamiento y validación](docs/WELCOME.md).
