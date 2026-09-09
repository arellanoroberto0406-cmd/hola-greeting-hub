# Panel de tiendas, dominios y contacto

## Objetivo
Convertir “Mis Tiendas” en una pantalla central para administrar cada tienda, su enlace público, dominio y datos de contacto sin entrar al editor.

## Cambios
- Reorganizar la pantalla con resumen de tiendas activas y tarjetas claras por tienda.
- Añadir configuración individual en una ventana con apartados de Información, Dominio y Contacto.
- Permitir editar nombre, descripción, teléfono, correo, dirección, WhatsApp, sitio web y redes sociales.
- Mostrar el enlace publicado actual, copiarlo y abrirlo; incluir una acción guiada para conectar un dominio propio.
- Mantener los controles actuales de tema, acento y secciones visibles.
- Guardar los cambios en la tienda correspondiente y actualizar inmediatamente la pantalla.

## Detalles técnicos
- Reutilizar los datos y permisos existentes de cada tienda; no se crearán tablas nuevas.
- Mantener ocultos los datos sensibles de cobro.
- Usar componentes y estilos del panel actual, con estados de carga, guardado y error.
- Verificar compilación y comportamiento adaptable a escritorio y móvil.
