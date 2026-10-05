# Asistente de diseño personalizado

## Resultado
Cada dueño podrá describir el estilo que busca y recibir una propuesta completa de colores, tipografías y secciones, revisarla y decidir si la aplica.

## Experiencia dentro del editor
- Añadir un bloque destacado **Diseñar con IA** al mosaico de personalización.
- Abrir un formulario sencillo con una descripción libre y sugerencias de ejemplo.
- Generar una propuesta con nombre, explicación breve, tres colores, pareja tipográfica y secciones recomendadas.
- Mostrar la propuesta visualmente antes de cambiar la tienda.
- Permitir **Aplicar propuesta**, **Generar otra** o cerrar sin guardar.
- Aplicar únicamente opciones compatibles con el plan actual; las recomendaciones premium aparecerán bloqueadas con explicación.
- Mantener la publicación como acción separada, evitando que la IA cambie la tienda pública sin confirmación.

## Integración segura
- Crear una función protegida que valide al dueño de la tienda antes de generar la propuesta.
- Usar Lovable AI Gateway con el modelo asignado `openai/gpt-6-astra`; la clave y el prompt permanecerán en el servidor.
- Transmitir la llamada al Gateway y devolver una propuesta validada, sin exponer razonamiento interno.
- Limitar y sanear la descripción, validar colores, tipografías y tipos de sección contra listas permitidas.
- Mostrar en pantalla los mensajes reales de falta de créditos, límite o configuración sin inventar propuestas.

## Persistencia y aplicación
- Reutilizar el guardado actual del diseño para colores, tipografías y orden/activación de secciones.
- La propuesta se reflejará primero en la vista previa; solo se guardará al pulsar **Publicar cambios**.
- Conservar textos y ajustes existentes de cada sección al reorganizarlas.

## Validación
- Probar una generación real y revisar la respuesta del Gateway.
- Confirmar propiedad de tienda y rechazo de solicitudes no autorizadas.
- Verificar aplicar, descartar, regenerar y publicar.
- Revisar la experiencia en móvil y escritorio y dejar la compilación limpia.
