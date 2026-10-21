# Versión 0.2.2

- Android: conserva el mismo reproductor, canal y posición al girar entre vertical y apaisado, evitando que Android destruya la actividad por el cambio de orientación.
- Android: mantiene encendida la pantalla mientras reproduce o carga un canal. Libera esa condición al pausar, cerrar el reproductor o enviar la aplicación al fondo. No requiere un permiso adicional ni un bloqueo de CPU.
- Todas las versiones: Argentina primero; luego ESPN, priorizando sus feeds argentinos; después los demás canales agrupados por país en orden alfabético en español. Dentro de cada grupo los nombres siguen orden natural (2 antes de 10). El selector de países también empieza por Argentina.
- Se conservan colores, controles y disposición de la interfaz.

Validación: pruebas automatizadas del catálogo y orden, comprobación del paquete de extensión y compilaciones en GitHub Actions. La rotación y el tiempo de suspensión requieren confirmación en un dispositivo físico; no se dispone de una prueba ejecutada en teléfono desde este entorno.
