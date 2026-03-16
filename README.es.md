# SPECTRA

> **S**ource · **P**roduct · **E**xhaustive · **C**ontractual · **T**ruth · **R**econstructable · **A**gentic

**El framework de especificación diseñado para ser consumido por IA, no por humanos.**

---

## El problema

Le das una tarea a un agente de IA. Le explicas qué quieres. Lo construye. Pero adivina las reglas de negocio, ignora la normativa, inventa las excepciones. A los 10 mensajes lo estás corrigiendo en cada paso.

No es un problema de la IA. Es un problema de contexto.

**La IA no falla porque sea incapaz. Falla porque no sabe lo que tú sí sabes.**

---

## La solución

Spectra es un framework para escribir especificaciones que una IA puede consumir directamente — sin ambigüedad, sin contexto adicional, sin que la corrijas en cada paso.

No es documentación técnica. No es un README. No son comentarios en el código.

Es la **fuente de verdad del dominio**: reglas de negocio, invariantes, contratos, normativa, decisiones — todo estructurado en 12 capas diseñadas para que un agente opere de forma autónoma.

```
Tú defines el dominio  →  Spectra estructura las specs  →  La IA construye, mantiene y evoluciona el sistema
```

---

## Qué hace diferente a Spectra

| | Documentación tradicional | OpenSpec | **Spectra** |
|---|---|---|---|
| **Destinatario** | Humanos | Agentes de código | Agentes de dominio |
| **Qué describe** | Cómo funciona | Cómo evoluciona el código | Qué es el sistema |
| **Incluye normativa** | Rara vez | No | Sí, obligatorio |
| **Incluye invariantes** | No | No | Sí, booleanas |
| **Reconstrucción** | Imposible | Parcial | Total |
| **Capa** | Sobre el código | Sobre el código | Antes del código |

**Spectra y OpenSpec no compiten — son capas distintas. Spectra va primero.**

---

## Las 13 capas

```
00 · Visión y Contexto        ← qué es y para quién
01 · Glosario de Dominio      ← el lenguaje canónico
02 · Historias de Usuario     ← qué necesitan los usuarios
03 · Reglas de Negocio        ← cada regla con fuente normativa
04 · Invariantes              ← condiciones siempre verdaderas
05 · Contratos de Operación   ← pre/postcondiciones por operación
06 · Políticas de Decisión    ← árboles SI/ENTONCES
07 · Eventos de Dominio       ← hechos y sus consecuencias
08 · Agentes                  ← actores autónomos del sistema
09 · Skills                   ← capacidades atómicas invocables
10 · Workflows                ← orquestación de agentes y skills
11 · Criterios de Aceptación  ← tests en lenguaje natural
──────────────────────────────────────────────────────────────
12 · SPECTRA-TRACE            ← matriz de trazabilidad agéntica
```

Las capas 00-11 son **estáticas** — definen el dominio. La capa 12 es **viva** — el agente la actualiza automáticamente al final de cada iteración.

Cada capa tiene un formato exacto. Cada elemento tiene un ID único. Todo está referenciado cruzadamente.

---

## Cómo funciona

### 1. Rellenas el prompt universal

```
SPECTRA-PROMPT.md contiene las variables que defines:
nombre del proyecto, sector, normativa, usuarios, módulos,
reglas conocidas, restricciones regulatorias...
```

### 2. La IA genera las 12 capas

Un LLM con el prompt completo genera la especificación estructurada de tu dominio. No es código — es conocimiento de negocio en formato machine-readable.

### 3. El agente construye con las specs como contexto

Con las specs en contexto, el agente puede:
- Construir la app sin que expliques cada decisión
- Respetar los invariantes al generar código
- Detectar conflictos con las reglas de negocio
- Reconstruir el sistema completo si algo se rompe

### 4. Tú evolucionas las specs, la IA evoluciona el sistema

Cuando cambia una regla de negocio, cambias la spec. El agente propaga el cambio correctamente porque entiende el dominio completo.

---

## Caso de uso real: GastroFlow

El repo incluye **GastroFlow** — una app completa de gestión de restaurante construida 100% con Spectra:

- 12 capas de specs completas
- App React 19 + Vite 8 + Tailwind v4
- Lógica contable con doble partida
- Facturación con IVA y normativa española
- Reconstruible desde cero leyendo solo las specs

> [Ver GastroFlow →](./examples/gastroflow/)

---

## Estructura del repo

```
spectra/
├── README.md                     ← estás aquí
├── MANIFESTO.md                  ← los 7 principios de SPECTRA
├── SPECTRA-PROMPT.md             ← el prompt universal (rellena y usa)
├── GUIA-VARIABLES.md             ← qué poner en cada variable
├── layers/
│   ├── 00-vision.md
│   ├── 01-glosario.md
│   ├── 02-historias.md
│   ├── 03-reglas-negocio.md
│   ├── 04-invariantes.md
│   ├── 05-contratos.md
│   ├── 06-politicas.md
│   ├── 07-eventos.md
│   ├── 08-agentes.md
│   ├── 09-skills.md
│   ├── 10-workflows.md
│   ├── 11-criterios-aceptacion.md
│   └── 12-trace.md               ← SPECTRA-TRACE · matriz bidireccional viva
├── examples/
│   ├── gastroflow/               ← caso de uso completo
│   └── saas-gestion/             ← ejemplo rellenado
├── vs-openspec.md                ← Spectra vs OpenSpec y GitHub Spec Kit
└── vs-frameworks.md              ← Spectra vs RTM, BDD, ADR, Backstage, SBOM, OTel
```

---

## Empieza ahora

```bash
# 1. Clona el repo
git clone https://github.com/tuusuario/spectra

# 2. Abre el prompt universal
# spectra/SPECTRA-PROMPT.md

# 3. Rellena las variables con la guía
# spectra/GUIA-VARIABLES.md

# 4. Pega el prompt en Claude, GPT-4o o Gemini

# 5. Guarda las 12 capas generadas en tu repo
# Las specs SON tu proyecto. El código es un artefacto derivado.
```

---

## Por qué esto importa ahora

Los agentes de IA están pasando de asistentes a ejecutores autónomos. La diferencia entre un agente que funciona bien y uno que falla no está en el modelo — está en si el agente conoce el dominio en el que opera.

Spectra es la infraestructura de conocimiento que los agentes necesitan para operar solos.

**Las specs no son documentación. Son el sistema.**

---

## Licencia

MIT — úsalo, adáptalo, mejóralo.

---

*Spectra fue construido con IA, describe cómo construir con IA, y es el manual que la IA usa para mantenerse. Esa recursividad no es accidental — es el punto.*
