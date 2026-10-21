# Verificación — 21/10/2026 · 0.2.1

- 11 pruebas unitarias aprobadas: parser M3U, protocolos admitidos, rechazo de HTML, deduplicación, filtros, exclusión inglesa por URL/ID/metadatos de feed, offsets XMLTV e IDs exactos.
- Catálogo real filtrado: 2.308 URLs únicas, 38 países de origen y 28 categorías. Copias fuente: español 2.402 entradas, inglés 3.025 entradas (solo exclusión).
- Interfaz Linux Electron ejecutada en modo headless: filtros país/categoría combinados (Argentina: 190; Argentina + noticias: 12), búsqueda, favoritos y viewport móvil sin desbordes. Sin errores JavaScript.
- Parser XMLTV probado en el DOM real: entidades XML estándar, filtro por ID exacto, rechazo de XML mal formado y DTD/entidades externas.
- 463 IDs tienen candidato EPG seleccionado desde archivos reales de iptv-org/epg. Prueba real de 12 candidatos: 10 devolvieron 238 programas en total; 2 agotaron tiempo de espera. Se incluye esa instantánea parcial con fecha. La selección restante no certifica disponibilidad.
- Reproducción real de canales y controles físicos de Android TV pendientes de validación.
- Compilación local Android bloqueada por red, resuelta usando GitHub Actions: APK debug generada correctamente.
- GitHub Actions también generó Windows NSIS/portable y Linux AppImage en sus runners nativos. Paquete web/extensión preparado.
- Run de referencia: https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/runs/39678002074
- Texto «Sin Informar» comprobado en la interfaz real para programa actual y siguiente sin datos.
- Los binarios 0.1.0 generados durante el desarrollo son obsoletos y no se publican como versión actual.

Estado: prototipo experimental. El estado de compilación de cada destino se informa en GitHub Actions.

## Verificación adicional 0.2.1

- 16 pruebas unitarias aprobadas, incluidas equivalencias no ambiguas, combinación por prioridad, gzip válido/corrupto y rechazo de salida descomprimida mayor de 40 MB.
- Se consultaron siete endpoints reales: todos respondieron HTTP 200 y XMLTV. Seis aportaron coincidencias verificables y se incorporaron como opciones; dobleM no se habilitó sin equivalencias.
- 31 aliases explícitos, todos referidos a feeds del catálogo español permitido.
- Interfaz base probada de nuevo en Electron Linux. La ejecución de la compilación 0.2.1 se informa en GitHub Actions; los binarios 0.2.0 son de la entrega anterior.

- Prueba de interfaz con respuestas reales descargadas: guía incluida + Argentina + archivo gzip español, 3 fuentes y 21 señales con datos combinados. Se verificó el selector, aliases y descompresión en el DOM real.

- Compilación final 0.2.1 aprobada para Windows, Linux y Android; web/extensión empaquetadas: https://github.com/DarkCristian/Cristal-Clear-Xuper-IPTV/actions/runs/39679556584
- Caché PWA: comprobada eliminación de versiones anteriores y lectura offline desde la caché actual.
