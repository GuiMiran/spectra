# PROMPT UNIVERSAL — Spec-Driven Development para IA Agéntica

> **Instrucciones**: Copia este prompt, rellena las variables entre `{{llaves}}` y pásalo a la IA.
> Todo lo que está entre `{{...}}` es lo que TÚ defines según tu proyecto.

---

## INICIO DEL PROMPT

---

Actúa como un **Arquitecto de Especificaciones** experto en Spec-Driven Development (SDD). Tu misión es generar la especificación completa, exhaustiva y consumible por IA agéntica para el siguiente proyecto. **No generes código ni arquitectura técnica**. Solo especificaciones funcionales, reglas, invariantes y definiciones que una IA agéntica pueda usar como fuente de verdad para construir el sistema.

---

### BLOQUE 1 — CONTEXTO DEL PROYECTO

```
Nombre del proyecto:     {{NOMBRE_PROYECTO}}
Tipo de producto:        {{TIPO_PRODUCTO}}  
                         (Ej: SaaS, App Móvil, Plataforma Web, API, Marketplace, ERP...)
Sector / Industria:      {{SECTOR}}
                         (Ej: Salud, Retail, Finanzas, Educación, Hostelería, Legal...)
País / Jurisdicción:     {{PAIS_JURISDICCION}}
                         (Ej: España, México, USA, UE multi-país...)
Normativa aplicable:     {{NORMATIVA}}
                         (Ej: "Ley de IVA española, Reglamento Facturación RD 1619/2012, 
                          RGPD, VeriFactu, Ley Crea y Crece"...)
Modelo de negocio:       {{MODELO_NEGOCIO}}
                         (Ej: Suscripción mensual, Freemium, Pago por uso, Licencia...)
```

---

### BLOQUE 2 — DESCRIPCIÓN DEL PRODUCTO

```
¿Qué hace el producto?
{{DESCRIPCION_PRODUCTO}}
(Describe en lenguaje natural qué problema resuelve y para quién.
 Ej: "Plataforma de gestión integral para pymes y autónomos españoles 
 que permite facturación, control de gastos, cálculo de impuestos y 
 presentación de modelos fiscales ante la AEAT.")

¿Quiénes son los usuarios?
{{USUARIOS}}
(Lista los tipos de usuario / roles.
 Ej: "Autónomo, Administrador pyme, Contable externo, Empleado, Auditor")

¿Cuáles son los módulos principales?  
{{MODULOS}}
(Lista las áreas funcionales.
 Ej: "Facturación, Clientes/Proveedores, Productos/Servicios, Gastos, 
 Tesorería, Impuestos, Contabilidad, Nóminas, Inventario, Reporting")
```

---

### BLOQUE 3 — REGLAS Y RESTRICCIONES CONOCIDAS

```
Reglas de negocio que ya conozco:
{{REGLAS_CONOCIDAS}}
(Lista cualquier regla que ya sepas que aplica.
 Ej: "IVA general 21%, reducido 10%, superreducido 4%. 
 Las facturas deben ser secuenciales sin saltos. 
 Las facturas rectificativas deben referenciar la original.
 Retención IRPF estándar profesional al 15%.")

Restricciones regulatorias:
{{RESTRICCIONES_REGULATORIAS}}
(Ej: "Obligación de factura electrónica desde 2026 Ley Crea y Crece.
 Conservación facturas 4 años mínimo. 
 Comunicación operaciones >3.005,06€ via modelo 347.")

Integraciones externas necesarias:
{{INTEGRACIONES}}
(Ej: "AEAT (Sede Electrónica), VIES (validación VAT intracomunitario),
 Bancos (extractos), Pasarela de pago, Correo electrónico")
```

---

### BLOQUE 4 — LO QUE NECESITO QUE GENERES

Genera la especificación completa organizada en las siguientes **12 capas**, cada una en su propio archivo/sección:

#### CAPA 00 — VISIÓN Y CONTEXTO (`00-vision/`)
- Propósito del producto
- Problema que resuelve
- Usuarios objetivo y sus necesidades
- Alcance funcional (qué incluye y qué NO incluye)
- Marco regulatorio aplicable (resumen ejecutivo)

#### CAPA 01 — GLOSARIO DE DOMINIO (`01-glosario/`)
- Diccionario de todos los términos de negocio
- Cada término con: **Nombre**, **Definición inequívoca**, **Ejemplo**, **Sinónimos a evitar**
- Organizado por contexto (fiscal, comercial, contable, legal...)
- Este glosario es el lenguaje canónico: toda la spec usa estos términos

#### CAPA 02 — HISTORIAS DE USUARIO (`02-historias/`)
- Formato: `COMO [rol] QUIERO [acción] PARA [beneficio]`
- Agrupadas por módulo funcional
- Cada historia con: **ID único**, **Prioridad** (Must/Should/Could), **Criterios de aceptación en formato DADO/CUANDO/ENTONCES**
- Incluir historias para flujos principales Y flujos alternativos/errores

#### CAPA 03 — REGLAS DE NEGOCIO (`03-reglas-negocio/`)
- Formato: `RN-XXX: [Descripción de la regla]`
- Cada regla con: **ID**, **Descripción**, **Fuente normativa** (ley, artículo, costumbre del sector), **Ejemplos**, **Excepciones**
- Agrupar por dominio: Fiscal, Facturación, Comercial, Laboral, Contable...
- **Incluir TODAS las reglas derivadas de la normativa aplicable**

#### CAPA 04 — INVARIANTES (`04-invariantes/`)
- Condiciones que SIEMPRE deben ser verdaderas en cualquier estado del sistema
- Formato: `INV-XXX: [condición booleana en lenguaje natural]`
- Ejemplos: "El total de una factura siempre = suma de líneas + impuestos - retenciones"
- Si una invariante se viola, el sistema está en estado corrupto

#### CAPA 05 — CONTRATOS DE OPERACIÓN (`05-contratos/`)
- Para cada operación importante del sistema:
  - **Precondiciones**: qué debe ser cierto ANTES de ejecutar
  - **Postcondiciones**: qué debe ser cierto DESPUÉS de ejecutar
  - **Errores**: qué pasa si falla
- Formato: `OPERACIÓN: [nombre]` / `PRE: [condiciones]` / `POST: [condiciones]` / `ERROR: [casos]`

#### CAPA 06 — POLÍTICAS DE DECISIÓN (`06-politicas/`)
- Reglas de decisión condicionales tipo SI/ENTONCES
- Tablas de decisión para lógica compleja (ej: qué tipo de IVA aplicar según producto + territorio + cliente)
- Formato: `POL-XXX: SI [condición] ENTONCES [acción] SI_NO [alternativa]`
- Incluir árboles de decisión completos para flujos fiscales

#### CAPA 07 — EVENTOS DE DOMINIO (`07-eventos/`)
- Hechos significativos que ocurren en el sistema
- Formato: `EVT-XXX: [NombreEvento] → DISPARA: [reacciones]`
- Qué produce cada evento y qué consecuencias tiene
- Ejemplo: "FacturaEmitida → registrar en libro IVA + actualizar saldo cliente + generar PDF"

#### CAPA 08 — AGENTES (`08-agentes/`)
- Actores de IA autónomos que operan sobre el dominio
- Cada agente con: **Nombre**, **Responsabilidad** (qué gestiona), **Skills que usa**, **Eventos que escucha**, **Eventos que produce**, **Invariantes que debe respetar**
- Los agentes NO son técnicos: son roles funcionales autónomos
- Ejemplo: "AgenteFacturación → responsable de crear, validar y emitir facturas"

#### CAPA 09 — SKILLS (`09-skills/`)
- Capacidades atómicas e invocables
- Cada skill con: **Nombre**, **Descripción**, **Entrada**, **Salida**, **Reglas de negocio que aplica**, **Invariantes que verifica**
- Son las "piezas de lego" que los agentes combinan
- Ejemplo: "calcular_iva → entrada: importe + tipo_producto + territorio → salida: desglose IVA"

#### CAPA 10 — WORKFLOWS (`10-workflows/`)
- Flujos de trabajo que orquestan agentes y skills
- Cada workflow con: **Nombre**, **Trigger** (qué lo inicia), **Pasos ordenados**, **Agentes involucrados**, **Skills invocadas por paso**, **Resultado esperado**, **Gestión de errores**
- Ejemplo: "Workflow Cierre Trimestral → paso 1: AgenteContable.skill:cuadrar_cuentas → paso 2: AgenteFiscal.skill:calcular_modelo_303..."

#### CAPA 11 — CRITERIOS DE ACEPTACIÓN (`11-criterios-aceptacion/`)
- Tests funcionales expresados en lenguaje natural
- Formato DADO/CUANDO/ENTONCES
- Vinculados a: Historias (HU-XXX), Reglas (RN-XXX), Invariantes (INV-XXX)
- Cubrir: camino feliz, errores esperados, casos límite, combinaciones fiscales

#### ÍNDICE MAESTRO (`SPEC-INDEX.md`)
- Mapa navegable de toda la especificación
- Referencias cruzadas entre capas (qué regla afecta a qué historia, qué skill usa qué agente...)
- Convenciones de nomenclatura y formato
- Instrucciones para la IA agéntica sobre cómo consumir las specs

---

### BLOQUE 5 — INSTRUCCIONES DE FORMATO Y CALIDAD

```
Formato de salida:        Markdown estructurado, un archivo por capa
Idioma:                   {{IDIOMA}} (Ej: "Español de España")
Nivel de detalle:         Exhaustivo — cada regla, cada caso, cada excepción
Lenguaje:                 Funcional, de negocio. SIN jerga técnica ni de programación
IDs únicos:               Cada elemento debe tener ID único y trazable
                          (HU-001, RN-001, INV-001, POL-001, EVT-001, AG-001, SK-001, WF-001)
Referencias cruzadas:     Cada skill debe referenciar las reglas que aplica.
                          Cada agente debe referenciar los skills que usa.
                          Cada workflow debe referenciar agentes y skills.
                          Cada criterio de aceptación debe referenciar historias y reglas.
Completitud normativa:    {{COMPLETITUD_NORMATIVA}}
                          (Ej: "Incluir TODA la normativa fiscal española aplicable 
                          a pymes y autónomos: IVA, IRPF, IS, facturación electrónica, 
                          modelos tributarios, SII, VeriFactu, RGPD")
```

---

### BLOQUE 6 — CONTEXTO ADICIONAL (OPCIONAL)

```
Competidores / Referencias:  {{COMPETIDORES}}
                              (Ej: "Holded, Quipu, Contasol, Sage, A3")
                              
Diferenciación:              {{DIFERENCIACION}}
                              (Ej: "IA que automatiza la presentación fiscal y 
                              predice cash flow")

Restricciones de alcance:    {{RESTRICCIONES_ALCANCE}}
                              (Ej: "Solo España peninsular en fase 1. 
                              IGIC / IPSI Canarias y Ceuta/Melilla en fase 2")

Información adicional:       {{INFO_ADICIONAL}}
                              (Cualquier otro dato relevante: documentos de referencia,
                              procesos actuales manuales que se quieren digitalizar, etc.)
```

---

## FIN DEL PROMPT

---
