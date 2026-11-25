# SPECTRA — Prompt Maestro de Generación de Specs

> Pega este prompt en GitHub Copilot Chat (o cualquier LLM).
> Adjunta o pega el contenido del .md generado por el catálogo.
> El agente creará toda la carpeta /specs con los 13 ficheros rellenos.
> NO genera código. Solo specs.

---

## INSTRUCCIONES PARA EL AGENTE

Eres un Arquitecto de Especificaciones experto en el framework SPECTRA.

A continuación te proporciono las reglas de negocio base de un proyecto.
Tu misión es expandirlas y crear la estructura completa de specs en 13 ficheros.

**Reglas absolutas:**
- NO generes código, arquitectura técnica ni decisiones de implementación
- SÍ genera especificaciones funcionales exhaustivas en lenguaje de negocio
- Cada fichero debe estar completamente relleno, no con placeholders
- Todos los IDs deben ser únicos y con referencias cruzadas entre ficheros
- El idioma es español de España

---

## INPUT: REGLAS DE NEGOCIO BASE

[PEGA AQUÍ EL CONTENIDO DEL .md GENERADO POR EL CATÁLOGO]

---

## OUTPUT REQUERIDO: 13 FICHEROS EN /specs

Crea los siguientes ficheros con contenido completo:

### /specs/00-index.md
Tabla de dispatch: para cada tarea posible del agente, qué ficheros debe leer.
Incluir al menos estas tareas:
- Construir el sistema desde cero
- Añadir un módulo nuevo
- Depurar un error de negocio
- Verificar que la app está completa
- Implementar un workflow específico

### /specs/01-glosario.md
Diccionario canónico del dominio. Para cada término:
- Nombre
- Definición inequívoca (no ambigua)
- Ejemplo concreto
- Sinónimos a evitar
Mínimo 15 términos del sector.

### /specs/02-historias.md
Historias de usuario en formato: COMO [rol] QUIERO [acción] PARA [beneficio]
Para cada historia:
- ID único (HU-001, HU-002...)
- Prioridad: Must / Should / Could
- Criterios de aceptación: DADO / CUANDO / ENTONCES
Cubrir todos los roles y módulos. Mínimo 15 historias.

### /specs/03-reglas-negocio.md
Todas las reglas con formato:
**RN-XXX**: [descripción]
- Fuente normativa: [ley/reglamento/costumbre del sector]
- Ejemplo: [caso concreto]
- Excepción: [si existe]
Incluir TODA la normativa española aplicable al sector.
Agrupar por dominio: Fiscal, Facturación, Operacional, Legal.

### /specs/04-invariantes.md
Condiciones que SIEMPRE deben ser verdaderas. Si se violan, el sistema está corrupto.
Formato:
**INV-XXX**: [condición en lenguaje natural]
- Tipo: Business | Technical | Architectural
- Consecuencia si se viola: [qué pasa]
- Verificado por: [SK-XXX o WF-XXX que lo comprueba]
Mínimo 10 invariantes.

### /specs/05-contratos.md
Para cada operación crítica del sistema:
```
OPERACIÓN: [nombre]
PRE: [qué debe ser cierto antes]
POST: [qué debe ser cierto después]
ERROR: [qué pasa si falla]
REVIERTE: [qué se deshace si hay error]
```
Cubrir las 5-8 operaciones más importantes.

### /specs/06-politicas.md
Reglas de decisión condicionales y tablas de decisión.
Formato:
**POL-XXX**: SI [condición] ENTONCES [acción] SI_NO [alternativa]
Incluir tablas completas para:
- Tipos de IVA según producto/servicio
- Permisos por rol de usuario
- Flujos alternativos según estado
- Precios y descuentos si aplica

### /specs/07-eventos.md
Hechos significativos del sistema con sus reacciones en cadena.
Formato:
**EVT-XXX**: [NombreEvento]
- Trigger: [qué lo provoca]
- Dispara: [lista de reacciones]
- Notifica a: [roles que deben enterarse]
- Registra en: [dónde queda constancia]
Mínimo 8 eventos.

### /specs/08-agentes.md
Actores funcionales autónomos (NO técnicos).
Para cada agente:
**AG-XXX**: [NombreAgente]
- Responsabilidad: [qué dominio gestiona]
- Skills que usa: [SK-XXX, SK-XXX]
- Eventos que escucha: [EVT-XXX]
- Eventos que produce: [EVT-XXX]
- Invariantes que debe respetar: [INV-XXX]

### /specs/09-skills.md
Capacidades atómicas invocables.
Para cada skill:
**SK-XXX**: [nombre_skill]
- Descripción: [qué hace en una frase]
- Entrada: [parámetros con tipo]
- Salida: [resultado con tipo]
- Reglas que aplica: [RN-XXX, RN-XXX]
- Invariantes que verifica: [INV-XXX]
- Usado por: [AG-XXX]
Mínimo 8 skills.

### /specs/10-workflows.md
Flujos de trabajo completos.
Para cada workflow:
**WF-XXX**: [NombreWorkflow]
- Trigger: [qué lo inicia]
- Agentes involucrados: [AG-XXX]
- Pasos ordenados: [numerados, con skill invocada]
- Resultado esperado: [postcondición]
- Gestión de errores: [qué pasa si falla cada paso]
Cubrir todos los flujos del Bloque 4 del input.

### /specs/11-criterios-aceptacion.md
Tests funcionales en lenguaje natural.
Formato:
**AC-XXX**: [nombre del test]
- Historia vinculada: HU-XXX
- Regla vinculada: RN-XXX
- Invariante vinculada: INV-XXX
- DADO [contexto inicial]
- CUANDO [acción que se ejecuta]
- ENTONCES [resultado esperado]
Cubrir: camino feliz, errores esperados, casos límite.
Mínimo 15 criterios.

### /specs/12-trace.md (SPECTRA-TRACE)
Matriz de trazabilidad bidireccional. Dos tablas:

**Tabla Spec → Code** (gaps funcionales):
| ID Spec | Descripción | Módulo esperado | Estado |
|---------|-------------|-----------------|--------|
| HU-001 | ... | ... | Pendiente |

**Tabla Code → Spec** (gaps técnicos):
Vacía inicialmente. El agente la rellena durante la construcción.

### /specs/SPEC-INDEX.md
Índice maestro navegable:
- Mapa de referencias cruzadas completo
- Qué RN afecta a qué HU
- Qué SK usa qué RN
- Qué WF involucra qué agentes
- Convenciones de nomenclatura
- Instrucciones para el agente constructor

---

## CRITERIOS DE CALIDAD

Antes de entregar, verifica:
- [ ] Todos los IDs son únicos y sin saltos
- [ ] Cada SK referencia sus RN e INV
- [ ] Cada WF referencia sus AG y SK
- [ ] Cada AC referencia su HU, RN e INV
- [ ] Los invariantes cubren todos los casos críticos del negocio
- [ ] La normativa española del sector está completa en 03-reglas-negocio.md
- [ ] El 00-index.md permite navegar a cualquier fichero desde cualquier tarea

---

## FORMATO DE ENTREGA

Genera cada fichero completo y separado, con el encabezado:
```
# [nombre del fichero] — [nombre del negocio]
> Generado con SPECTRA · github.com/GuiMiran/spectra
```

Empieza por 00-index.md y sigue en orden numérico.
