# Recetas rápidas para tarjetas de producto

## Resultado
Cada comerciante podrá elegir un estilo completo para sus tarjetas de producto desde el mosaico de personalización y verlo antes de publicar.

## Qué se construirá
- Añadir un bloque **Tarjetas de producto** al editor Editorial Bento.
- Incluir recetas visuales claramente distintas: **Impacto**, **Boutique**, **Limpia** y **Catálogo**.
- Mostrar una miniatura real de cada receta con foto, etiqueta, nombre, precio y botón.
- Aplicar cada receta de una vez y permitir ajustar la cantidad de columnas desde la misma pantalla.
- Guardar la receta elegida junto con el diseño actual de cada tienda.
- Reflejarla automáticamente en productos destacados y catálogo de la tienda publicada.

## Detalles técnicos
- Ampliar la configuración persistida del diseño con `productCardPreset` y `productGridDensity`, manteniendo compatibilidad con tiendas existentes.
- Compartir clases semánticas entre la vista previa y las tarjetas públicas para que ambas coincidan.
- Conservar las restricciones actuales por plan, los datos de productos y el funcionamiento del carrito.
- Completar los estilos pendientes del editor Bento y verificar escritorio y móvil.

## Validación
- Confirmar que la selección cambia la vista previa inmediatamente.
- Guardar, recargar y comprobar que la receta persiste.
- Revisar catálogo y productos destacados en móvil y escritorio sin solapamientos.
