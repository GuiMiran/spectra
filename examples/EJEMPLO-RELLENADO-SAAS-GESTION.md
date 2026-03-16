# EJEMPLO RELLENADO — SaaS de Gestión Empresarial España

> Este es el prompt ya rellenado como ejemplo. Cópialo y adáptalo a tu caso.

---

Actúa como un **Arquitecto de Especificaciones** experto en Spec-Driven Development (SDD). Tu misión es generar la especificación completa, exhaustiva y consumible por IA agéntica para el siguiente proyecto. **No generes código ni arquitectura técnica**. Solo especificaciones funcionales, reglas, invariantes y definiciones que una IA agéntica pueda usar como fuente de verdad para construir el sistema.

---

### BLOQUE 1 — CONTEXTO DEL PROYECTO

```
Nombre del proyecto:     GestorPyme Pro
Tipo de producto:        SaaS Web multitenant
Sector / Industria:      Gestión empresarial, Contabilidad, Fiscalidad
País / Jurisdicción:     España (península + Baleares). Fase 2: Canarias (IGIC), Ceuta/Melilla (IPSI)
Normativa aplicable:     Ley 37/1992 del IVA, RD 1624/1992 Reglamento IVA, 
                         RD 1619/2012 Reglamento Facturación,
                         Ley 25/2013 Factura Electrónica sector público,
                         Ley 18/2022 Crea y Crece (factura electrónica B2B),
                         RD 1007/2023 VeriFactu (sistemas informáticos de facturación),
                         Ley IRPF (retenciones profesionales),
                         Ley 27/2014 Impuesto sobre Sociedades,
                         RGPD + LOPD-GDD,
                         Código de Comercio (obligaciones contables),
                         Plan General Contable 2007 (pymes)
Modelo de negocio:       Suscripción mensual/anual con 3 planes (Starter, Pro, Enterprise)
```

---

### BLOQUE 2 — DESCRIPCIÓN DEL PRODUCTO

```
¿Qué hace el producto?
Plataforma SaaS de gestión integral para pymes (hasta 50 empleados) y autónomos 
españoles. Automatiza facturación electrónica, gestión de gastos y compras, 
control de tesorería y cash flow, cálculo automático de impuestos (IVA, IRPF, IS), 
conciliación bancaria, contabilidad básica (PGC pymes), generación de libros 
registro obligatorios y modelos tributarios (303, 390, 111, 115, 130, 347, 349) 
para presentación ante la AEAT.

¿Quiénes son los usuarios?
- Autónomo (persona física, gestión propia)
- Administrador de pyme (gerente/dueño)
- Contable (interno o asesoría externa)
- Empleado (gastos, notas de gasto, partes de trabajo)
- Auditor (solo lectura, acceso a informes)
- Super Admin (gestión de la plataforma multi-tenant)

¿Cuáles son los módulos principales?
1. Facturación (emisión, recepción, rectificativas, recurrentes)
2. Clientes y Proveedores (CRM básico, datos fiscales)
3. Productos y Servicios (catálogo, precios, tipos IVA)
4. Gastos y Compras (registro, categorización, tickets/OCR)
5. Tesorería (cobros, pagos, previsión, conciliación bancaria)
6. Impuestos (cálculo, modelos tributarios, calendario fiscal)
7. Contabilidad (PGC pymes, asientos, balance, PyG)
8. Nóminas (gestión básica, retenciones, modelo 111)
9. Reporting (dashboards, informes, KPIs)
10. Configuración (empresa, ejercicios, usuarios, permisos)
```

---

### BLOQUE 3 — REGLAS Y RESTRICCIONES CONOCIDAS

```
Reglas de negocio que ya conozco:
- IVA general 21%, reducido 10%, superreducido 4%, exento 0%
- Recargo de equivalencia: 5,2% (21%), 1,4% (10%), 0,5% (4%)
- Las facturas deben numerarse secuencialmente por serie, sin saltos
- Facturas simplificadas permitidas hasta 400€ (o 3.000€ en ciertos sectores)
- Facturas rectificativas: por sustitución o por diferencias
- Plazo emisión factura: antes del día 16 del mes siguiente al devengo
- Retención IRPF profesional: 15% general, 7% nuevos autónomos (primeros 3 años)
- Modelo 303 IVA: trimestral (pymes) o mensual (SII/grandes empresas)
- Modelo 111 retenciones: trimestral
- Modelo 347: declaración anual operaciones >3.005,06€
- Modelo 349: operaciones intracomunitarias
- Criterio de caja opcional (Ley 14/2013)
- Deducibilidad gastos: requisitos de justificación y correlación con ingresos

Restricciones regulatorias:
- Desde 2026: obligación factura electrónica B2B (Ley Crea y Crece) para empresas >8M€
- VeriFactu: los sistemas de facturación deben garantizar integridad, 
  conservación, trazabilidad e inalterabilidad de registros
- Conservación de facturas: 4 años (obligación fiscal) / 6 años (Código Comercio)
- RGPD: consentimiento, derecho al olvido, portabilidad, DPO si procede
- SII (Suministro Inmediato de Información): obligatorio >6M€ facturación
- Formato Facturae 3.2.x para facturación al sector público

Integraciones externas necesarias:
- AEAT Sede Electrónica (presentación modelos)
- VIES (validación NIF-IVA intracomunitario)
- Sistema bancario (PSD2/Open Banking para conciliación)
- OCR para digitalización de tickets y facturas recibidas
- Correo electrónico (envío de facturas)
- Servicio de firma electrónica (factura electrónica)
```

---

### BLOQUE 4 — LO QUE NECESITO QUE GENERES

Genera la especificación completa organizada en las siguientes **12 capas**:

- CAPA 00: Visión y Contexto
- CAPA 01: Glosario de Dominio
- CAPA 02: Historias de Usuario
- CAPA 03: Reglas de Negocio
- CAPA 04: Invariantes
- CAPA 05: Contratos de Operación
- CAPA 06: Políticas de Decisión
- CAPA 07: Eventos de Dominio
- CAPA 08: Agentes
- CAPA 09: Skills
- CAPA 10: Workflows
- CAPA 11: Criterios de Aceptación
- ÍNDICE MAESTRO: SPEC-INDEX

*(Ver prompt principal SPEC-DRIVEN-PROMPT.md para la descripción detallada de cada capa)*

---

### BLOQUE 5 — INSTRUCCIONES DE FORMATO Y CALIDAD

```
Formato de salida:        Markdown estructurado, un archivo por capa
Idioma:                   Español de España
Nivel de detalle:         Exhaustivo — cada regla, cada caso, cada excepción
Lenguaje:                 Funcional, de negocio. SIN jerga técnica ni de programación
IDs únicos:               HU-001, RN-001, INV-001, POL-001, EVT-001, AG-001, SK-001, WF-001, AC-001
Referencias cruzadas:     Sí, obligatorias entre todas las capas
Completitud normativa:    Incluir TODA la normativa fiscal española aplicable a pymes 
                          y autónomos vigente en 2024-2026, incluyendo las novedades de
                          factura electrónica obligatoria y VeriFactu
```

---

### BLOQUE 6 — CONTEXTO ADICIONAL

```
Competidores / Referencias:  Holded, Quipu, Billin, Contasol, Sage 50, A3 Asesor
Diferenciación:              IA agéntica que automatiza el 90% de la gestión fiscal:
                              auto-categorización de gastos, predicción de tesorería,
                              generación y presentación automática de modelos tributarios
Restricciones de alcance:    Fase 1: Solo España peninsular + Baleares
                              Fase 2: Canarias (IGIC), Ceuta y Melilla (IPSI)
                              Fase 3: Operaciones intracomunitarias avanzadas
                              NO incluir en fase 1: Nóminas completas (solo básico), 
                              Comercio exterior fuera UE, Grupos consolidados
```

---
