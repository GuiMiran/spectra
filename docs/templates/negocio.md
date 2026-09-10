# negocio.md — Datos del negocio concreto

> Este fichero contiene los datos ESPECÍFICOS de este negocio.
> Las reglas de cómo funciona el sector están en /specs/.
> Este fichero responde a: ¿quién es este negocio en concreto?
>
> El agente lee este fichero junto con /specs/ para construir
> un sistema personalizado para este negocio específico.

---

## Identidad

nombre: {{NOMBRE_DEL_NEGOCIO}}
tipo: {{TIPO}}
nif: {{NIF_CIF}}
direccion: {{DIRECCION}}
municipio: {{MUNICIPIO}}
provincia: {{PROVINCIA}}
telefono: {{TELEFONO}}
email: {{EMAIL}}
web: {{WEB_O_VACIO}}

---

## Horario

lunes:    {{HH:MM - HH:MM o "cerrado"}}
martes:   {{HH:MM - HH:MM o "cerrado"}}
miercoles: {{HH:MM - HH:MM o "cerrado"}}
jueves:   {{HH:MM - HH:MM o "cerrado"}}
viernes:  {{HH:MM - HH:MM o "cerrado"}}
sabado:   {{HH:MM - HH:MM o "cerrado"}}
domingo:  {{HH:MM - HH:MM o "cerrado"}}

---

## Empleados / Roles

propietario: {{NOMBRE}}
empleados:
  - nombre: {{NOMBRE}}
    rol: {{dependiente | repartidor | camarero | auxiliar | etc}}
  - nombre: {{NOMBRE}}
    rol: {{rol}}

---

## Catálogo de servicios / productos

# Adaptar según el tipo de negocio.
# Ejemplos por sector:

# PELUQUERÍA:
servicios:
  - id: corte_mujer
    nombre: Corte mujer
    precio: {{€}}
    duracion_min: {{minutos}}
  - id: corte_hombre
    nombre: Corte hombre
    precio: {{€}}
    duracion_min: {{minutos}}
  - id: tinte
    nombre: Tinte completo
    precio: {{€}}
    duracion_min: {{minutos}}

# BAR / CAFETERÍA:
# productos:
#   - id: cafe_solo
#     nombre: Café solo
#     precio: 1.50
#     iva: 10%
#   - id: cerveza
#     nombre: Cerveza 33cl
#     precio: 2.50
#     iva: 21%

# COLMADO:
# proveedores_principales:
#   - nombre: Makro
#   - nombre: Transgourmet
# stock_minimo_defecto: 5 unidades

---

## Configuración fiscal

regimen_iva: {{general | recargo_equivalencia | exento}}
epigraf_iae: {{código}}
mutua_accidentes: {{nombre o vacío}}

---

## Configuración operativa

# Adaptar según módulos activos

# CITAS (peluquería, clínica, taller...):
citas_anticipacion_max_dias: {{número}}
citas_cancelacion_min_horas: {{número}}
recordatorio_sms: {{true | false}}

# DELIVERY (colmado, pizzería...):
delivery_activo: {{true | false}}
delivery_radio_km: {{número}}
delivery_minimo_pedido: {{€}}
delivery_coste: {{€ o "gratis"}}

# MESAS (bar, restaurante...):
num_mesas: {{número}}
capacidad_por_mesa: {{número}}
reservas_online: {{true | false}}

# STOCK:
alerta_stock_minimo: {{true | false}}
metodo_valoracion: {{FIFO | LIFO | precio_medio}}

---

## Notas para el agente

# Añade aquí cualquier particularidad de este negocio concreto
# que no esté cubierta por las specs genéricas del sector.
# Ejemplo:
# - "Los martes hay descuento del 10% para pensionistas"
# - "No se aceptan pagos con tarjeta por debajo de 5€"
# - "El propietario es también el único empleado — no hay gestión de turnos"

notas_especiales:
  - {{nota 1}}
  - {{nota 2}}
