# EPG y grilla — versión 0.3.0

Integrado en `main` mediante el PR #6, después de fusionar el banner. Conserva la bienvenida con QR en cada inicio.

## Uso

«Guía de programación» cambia la vista del catálogo por una grilla de seis horas. El nombre del canal queda fijo a la izquierda; el área de horarios se desplaza horizontalmente. «Ahora», los botones de seis horas y el selector de fecha permiten recorrerla. Los filtros de búsqueda, país, categoría y favoritos también afectan la guía; «Solo con programación» muestra los canales con datos en la ventana visible. Se presentan 40 filas por vez y se pueden cargar más.

Seleccionar un programa muestra nombre, descripción y horario local; «Ver canal en vivo» abre la emisión actual. No ofrece catch-up, grabación, recordatorios ni reproducción de programas futuros. Los huecos se identifican como «Sin información» y no se inventa programación. Las variantes mantienen sus tvg-id: no se les asigna una guía aproximada por parecido de nombre.

## Actualización y límites

Las fuentes públicas de `web/data/epg-providers.json` se consultan al cargar el catálogo, con «Actualizar guía» y cada cuatro horas mientras la aplicación permanece abierta. La caché IndexedDB conserva la programación descargada cuando falla la red. Se descartan datos anteriores a 24 horas y posteriores a siete días; el contador de cobertura solo considera programas futuros o actuales.

Android usa una descarga HTTPS nativa para las seis URLs EPG permitidas. Windows/Linux usan un endpoint local de Electron con esa misma lista de fuentes. Ambas rutas limitan tamaño y tiempo, rechazan URLs arbitrarias y no siguen redirecciones. No se desactiva la validación TLS ni la seguridad de la WebView/Electron. Las URLs personalizadas de otras fuentes dependen del CORS del proveedor; siempre se puede importar XMLTV/XML.GZ.

La web depende de CORS. Chrome/Edge usan los permisos de dominios ya declarados. Una fuente puede cambiar, bloquear consultas o dejar de publicar datos: el estado enumera resultados y fallos. La actualización conserva otras fuentes que todavía tienen programación válida.

El job `epg-snapshot` del workflow obtiene programación reciente antes de compilar y entrega el mismo XMLTV a Android, Windows, Linux y extensiones. Si todas las fuentes fallan conserva la copia previa y registra el problema en `guide-status.json`; no finge una actualización. La captura local del 04/11/2026 aportó 2.097 programas para 36 identificadores del catálogo. Es una observación de esa ejecución, no una promesa de cobertura total.

## Orden solicitado a partir de Flow

Referencia principal: https://www.personal.com.ar/flow/guia-de-canales

El sitio adapta la grilla por servicio y zona. La consulta pública por zona devolvió HTTP 403 en esta sesión. Se usa como corroboración el listado nacional disponible en https://www.tvchannellists.com/w/List_of_channels_on_Flow_(Argentina). Es un **modelo nacional adaptado**, no una reproducción certificada de la grilla local de Flow. No usa credenciales, emisiones ni programación de Flow.

`web/data/channel-order.json` contiene el orden de referencia y los alias revisables. Se priorizan coincidencias exactas por nombre normalizado o identidad del canal; sus variantes se colocan consecutivas. Para una referencia ausente se coloca una familia disponible de la misma categoría, priorizando Argentina, sin quitar señales que coinciden con referencias posteriores. Los sustitutos muestran «Similar a …» y conservan nombre y EPG propios. Los canales restantes se agregan al final, agrupando sus variantes. La numeración visible es propia y consecutiva: no representa los números comerciales de Flow.

## Validación

Pruebas unitarias: clipping y huecos, prioridades entre fuentes, cobertura/expiración, orden de variantes/sustitutos y proxy de escritorio. Pruebas de navegador con programación sintética identificada como «de prueba»: grilla móvil/escritorio, filtros, navegación horaria, descripción sin HTML ejecutable, importación, recuperación de caché y transporte nativo simulado. Las capturas y los artifacts se publican en el workflow del PR. El autor del proyecto confirmó el funcionamiento de Android; no se certifican todos los streams ni todas las fuentes.
