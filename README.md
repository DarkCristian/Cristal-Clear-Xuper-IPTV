# Cristal Clear Xuper IPTV

[![Build experimental clients](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/workflows/build.yml/badge.svg)](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/workflows/build.yml)

Alternativa independiente de código abierto inspirada en aplicaciones populares de streaming, con listas IPTV públicas en español y guía XMLTV. No aloja ni controla las emisiones de terceros. El contenido se reproduce desde sus proveedores y está sujeto a sus derechos y condiciones.

**Versión experimental 0.2.0.** Proyecto propio: el ZIP de referencia era una extensión Chromium compilada, sin fuentes de desarrollo ni licencia en la raíz. No se copiaron sus bundles, imágenes o marcas, por lo que este repositorio no se presenta como fork de aplicaciones comerciales.

## Descargas experimentales

[Compilaciones verificadas de la versión 0.2.0](https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/runs/39678002074). En Artifacts: `cristal-clear-windows` (instalador y portable), `cristal-clear-linux` (AppImage), `cristal-clear-android-debug` (APK) y `cristal-clear-web-extension`. Se necesita iniciar sesión en GitHub para descargar artifacts. No es una release estable ni una certificación de reproducción de todas las señales.

## Funciones

- Catálogo completo de la lista oficial por idioma español de iptv-org, con filtros combinables por país de origen y categoría.
- Excluye URLs e IDs presentes en la lista inglesa y feeds declarados en inglés o bilingües español/inglés. No se infiere idioma por país ni por nombre.
- Incluye canales hispanohablantes de España, Latinoamérica y otros países. Portugués y otros idiomas quedan fuera. País de origen no significa disponibilidad territorial.
- Buscador sin tildes, favoritos locales, paginación, copias de respaldo y actualización de listas.
- Reproductor HLS, pantalla completa y selector de variantes cuando la señal las ofrece.
- Guía XMLTV: programa actual y próximo, importación de archivo o URL, vinculación por `tvg-id` exacto y horas en la zona local. Muestra «Sin Informar» cuando faltan datos.
- Extensión Chrome/Edge, web/PWA, escritorio Electron Windows/Linux y proyecto Android con reproductor Media3 nativo, launcher móvil y Android TV.

La clasificación lingüística depende de los índices públicos, no de un análisis de audio. Una URL puede cambiar de contenido o emitir programas en otro idioma. No se garantiza que toda emisión sea correcta o esté disponible.

## Extensión Chrome / Edge

Descargar el código y ejecutar `node scripts/prepare.mjs` (o usar la carpeta generada incluida en un paquete de código). Abrir `chrome://extensions` o `edge://extensions`, activar Modo de desarrollador y **Cargar descomprimida** → `build/extension/`. Pulsar el icono para abrir el cliente. Es una extensión de navegador, no un addon Kodi.

## Web / PWA

```sh
python -m http.server 8080 --bind 127.0.0.1 --directory web
```

Abrir http://localhost:8080. Para instalar como PWA o servirla a otros equipos, usar hosting estático HTTPS. No abrir index.html con doble clic. La caché conserva la interfaz y las listas; el video requiere Internet. No se publica un sitio automáticamente.

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

No se descarga programación para IDs ajenos al catálogo español. No hay búsqueda aproximada por nombre: evita asociar por error señales regionales distintas. No se aceptan DTD ni entidades XML. La importación admite XMLTV sin comprimir, hasta 40 MB.

## Fuentes, categorías y actualización

- [Listas de iptv-org](https://github.com/iptv-org/iptv/blob/master/PLAYLISTS.md).
- Lista de inclusión: https://iptv-org.github.io/iptv/languages/spa.m3u
- Exclusión de inglés: https://iptv-org.github.io/iptv/languages/eng.m3u
- País/categoría e idioma de feed: [API oficial](https://github.com/iptv-org/api).

La lista de idioma reúne las señales españolas que también aparecen en listas por país y categoría; no se cargan cientos de listas redundantes ni se incorpora una categoría internacional entera con sus canales ingleses. `web/data/catalog-report.json` contiene los recuentos fechados. La fuente «Películas» corresponde a televisión en vivo, no VOD.

Al abrir o actualizar, el cliente descarga español e inglés. Si fallan, usa caché y después las copias incluidas, informándolo en pantalla. Los metadatos se distribuyen con cada compilación. Para refrescar listas y metadatos de la fuente de código:

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
