# Rediseño estructurado del panel

## Objetivo
Recrear el panel de vendedor con la estructura visual de las cuatro referencias: fondo azul nocturno, navegación lateral clara, tarjetas de métricas, tablas compactas y acciones visibles. Se conservarán todas las funciones y datos reales existentes.

## Secciones
1. **Estructura general**
   - Unificar encabezado, buscador, perfil, navegación lateral y área de contenido.
   - Optimizar escritorio y transformar la navegación en panel deslizable en móvil.

2. **Inicio**
   - Encabezado de bienvenida, progreso de configuración y cuatro pasos accionables.
   - Métricas reales, accesos rápidos, vista de tienda y resumen del plan.

3. **Productos**
   - Encabezado y métricas de catálogo.
   - Lista más compacta y legible con imagen, categoría, precio, existencias, estado y acciones.
   - Mantener alta, edición, eliminación y carga de imágenes.

4. **Diseñar tienda**
   - Reorganizar herramientas en un estudio lateral y conservar la vista previa.
   - Mejorar jerarquía de guardar, publicar, secciones y selector escritorio/móvil.

5. **Pedidos y pagos**
   - Resumen de ventas, filtros y pedidos con estados claros.
   - Mantener detalle, cambio de estado, comprobantes, facturas y reembolsos.
   - Dar coherencia visual a métodos de pago y opciones para compartir.

## Detalles técnicos
- Crear estilos semánticos exclusivos del panel en el sistema de diseño, sin afectar la tienda pública ni el acceso.
- Dividir el catálogo en un componente dedicado para reducir complejidad.
- Usar los componentes existentes para botones, tarjetas, diálogos y controles.
- Mantener bloqueos por plan, permisos y consultas actuales sin cambios de lógica.
- Verificar compilación y revisar visualmente Inicio, Productos, Diseño y Pedidos en escritorio y móvil.
