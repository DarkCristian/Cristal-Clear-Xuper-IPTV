# Revisión de fuentes EPG — 21/10/2026

## Resultado

| Fuente | URL | Señales del catálogo con programas reconocidos | Programas reconocidos en la descarga de prueba |
|---|---|---:|---:|
| TDTChannels | https://www.tdtchannels.com/epg/TV.xml | 9 | 584 |
| Open EPG Argentina | https://www.open-epg.com/files/argentina2.xml | 11 | 591 |
| Open EPG España | https://www.open-epg.com/files/spain1.xml | 2 | 124 |
| Open EPG México | https://www.open-epg.com/files/mexico1.xml | 7 | 360 |
| Open EPG Perú | https://www.open-epg.com/files/peru1.xml | 7 | 300 |
| EPGShare España (gzip) | https://epgshare01.online/epgshare01/epg_ripper_ES1.xml.gz | 4 | 429 |

Estos valores son de una descarga concreta, no sumas de señales únicas entre fuentes ni cobertura de programas actualmente al aire. La selección usa el catálogo permitido y 31 equivalencias explícitas. Una guía puede incluir canales ingleses, catalanes o de otros idiomas: se descartan los que no puedan asociarse a nuestro catálogo español. No se distribuyen en el repositorio copias completas de estas guías.

Las seis fuentes respondieron HTTP 200 y XMLTV. El uso remoto desde navegador depende de CORS. Solo dobleM entregó `Access-Control-Allow-Origin: *` en los encabezados observados; las otras fuentes deben probarse desde el entorno del cliente o importarse como archivo. La extensión solicita permisos de host limitados para los proveedores habilitados. HTTPS accesible desde curl no equivale a acceso desde todos los navegadores.

## PLUGINSXBMC

https://www.pluginsxbmc.com/2019/10/guias-epg-actualizadas.html

Es un directorio de enlaces de terceros, no el proveedor de la programación. Las cifras de la página no se tomaron como cobertura actual: se descargaron y analizaron siete endpoints. No se usaron enlaces de los comentarios ni se siguieron instrucciones de terceros.

Se revisó además https://raw.githubusercontent.com/davidmuma/EPG_dobleM/master/guiatv.xml: HTTP 200, 643 IDs y 84.462 programas en el archivo, pero cero coincidencias verificadas con nuestros IDs. Sus identificadores son nombres propios y hay periodos mezclados; no se habilita como preset hasta definir equivalencias sin ambigüedad. No se presume que todos sus programas estén vigentes.

## Free-TV Argentina

https://github.com/Free-TV/IPTV/blob/master/lists/argentina.md

El archivo es una tabla de canales, enlaces de reproducción, logos e IDs EPG; no contiene horarios ni eventos XMLTV. Ejemplos de IDs base publicados son `Canal26.ar`, `Encuentro.ar`, `Telefe.ar`. Un ID base puede vincularse si corresponde a un solo feed permitido; no se equiparan automáticamente variantes regionales o nombres parecidos.

No se copiaron tablas, logos ni streams adicionales. No se trató YouTube como si fuera un enlace HLS, ni se incorporaron direcciones IP de terceros sin verificar su procedencia. El catálogo de reproducción no cambia en esta actualización.

## plugin.video.flow

https://github.com/mariano-git/plugin.video.flow

Se revisaron README, árbol de recursos, `flow/api/content.py`, `flow/client/contentclient.py` y el conversor `plugin/provider/epg/converter/flowprogram2xml.py`. El addon obtiene canales/programas mediante llamadas autenticadas y convierte esos datos a XMLTV; no hay una guía pública estática lista para descargar entre los recursos revisados. Su README exige una suscripción.

La arquitectura es una referencia de conversión, no una fuente EPG abierta para este cliente. No se reutilizaron código, logos, tokens, credenciales, endpoints de reproducción o DRM. La licencia MIT del addon no concede derechos sobre las emisiones ni acceso a la API de Flow.

## Asociación y respaldo

Se admiten ID exacto, equivalencia explícita de la fuente o ID base con un solo feed permitido. Nunca se asigna una programación por similitud de nombre. Para IDs desconocidos o ambiguos, o sin un programa que cubra la hora actual, se muestra **Sin Informar**.

El programa puede combinar varias guías. La fuente cargada más recientemente prevalece para programas actuales superpuestos; se usan las demás para cubrir huecos. Los archivos `.xml.gz` se detectan por su firma y se limitan a 40 MB de entrada y 40 MB descomprimidos. Se elimina únicamente la declaración convencional `<!DOCTYPE tv SYSTEM "xmltv.dtd">`, sin resolverla ni descargarla. XML mal formado, otras declaraciones DTD y entidades externas se rechazan.
