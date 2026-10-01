# Extender Volcanic Fire & Gold al carrito y pago

## Resultado
El carrito y todo el recorrido de compra conservarán la identidad Volcanic Fire & Gold: fondo negro, paneles de alto contraste, rojo volcán para acciones, naranja para avances y oro para precios y señales de confianza, sin cambiar la lógica de pedidos ni cobros.

## Cambios
- Rediseñar el carrito lateral y la barra móvil con productos, controles de cantidad, progreso de envío y llamada al pago coherentes con la tienda.
- Aplicar el tema al encabezado, pasos, formularios, opciones de pago, resumen del pedido y panel de seguridad.
- Integrar visualmente el pago embebido con tarjeta dentro de un marco Volcanic claro y confiable.
- Adaptar estados de carrito vacío, pago pendiente, pago fallido y confirmación de compra.
- Mantener todos los métodos de pago, validaciones, datos y navegación existentes.

## Verificación
- Probar carrito y compra en escritorio y móvil.
- Confirmar legibilidad, selección de métodos, navegación entre pasos y ausencia de solapes.
- Revisar que la vista previa compile sin errores.

## Detalles técnicos
- Mantener los estilos bajo `.volcanic` para no afectar paneles internos.
- Reutilizar los componentes y eventos actuales; los cambios serán de presentación.
- Usar las variables `--vc-*` como fuente única de color del tema.
