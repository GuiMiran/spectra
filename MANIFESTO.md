# SPECTRA MANIFESTO

> Los 7 principios del framework. Si algo viola uno de estos principios, no es Spectra.

---

## S · Source
### Las specs son la fuente. El código es el derivado.

El código se genera, se borra, se reescribe. Las specs permanecen.

Si pierdes el código pero guardas las specs, no pierdes nada esencial. Si pierdes las specs pero guardas el código, perdiste el conocimiento que hace que ese código tenga sentido.

En Spectra, las specs viven en el repo como ciudadanas de primera clase — no en Notion, no en Confluence, no en la cabeza de alguien. Son versionables, revisables, mergeables.

> **Consecuencia práctica**: antes de tocar el código, actualiza la spec. Siempre.

---

## P · Product
### El dominio de negocio, no la arquitectura técnica.

Spectra no describe cómo está construido el sistema. Describe qué es el sistema.

Una spec de Spectra no contiene nombres de tablas, endpoints, componentes React ni patrones de diseño. Contiene reglas de negocio, invariantes, flujos de usuario, normativa aplicable, glosario de dominio.

La arquitectura técnica es una decisión de implementación. El dominio de negocio es una verdad del mundo real.

> **Consecuencia práctica**: cualquier desarrollador, en cualquier stack, debería poder construir el mismo sistema leyendo solo las specs.

---

## E · Exhaustive
### Cada regla, cada caso límite, cada excepción.

Una spec incompleta es peor que no tener spec. El agente rellena los huecos con suposiciones — y las suposiciones son el origen de todos los bugs de negocio.

Especificar exhaustivamente significa incluir: las excepciones que "todo el mundo conoce", los casos límite que "nunca pasan", la normativa que "ya se sabe", las reglas implícitas que viven en la cabeza del fundador.

Si no está escrito, no existe para el agente.

> **Consecuencia práctica**: cuando dudes si incluir algo, inclúyelo. El coste de sobre-especificar es cero. El coste de sub-especificar es un agente que adivina.

---

## C · Contractual
### Precondiciones, postcondiciones, invariantes booleanas.

Las specs de Spectra no son narrativas. Son contratos.

Cada operación importante tiene precondiciones (qué debe ser verdad antes), postcondiciones (qué debe ser verdad después) y casos de error (qué pasa si falla). Cada invariante es una condición booleana — verdadera o falsa, sin ambigüedad.

El lenguaje natural es para el glosario. Las reglas son precisas.

> **Consecuencia práctica**: si una regla no puede expresarse como condición verificable, es que no está suficientemente definida. Vuelve al dominio y clarifica.

---

## T · Truth
### Una sola fuente de verdad. Sin contradicciones.

En un sistema Spectra existe exactamente una definición de cada concepto, exactamente una versión de cada regla, exactamente un lugar donde mirar cuando hay una duda.

Las contradicciones entre capas no son errores de escritura — son síntomas de que el dominio no está resuelto. Spectra los hace visibles porque todo está referenciado cruzadamente.

Un agente con dos fuentes de verdad contradictorias tomará decisiones arbitrarias. Un agente con una sola fuente de verdad tomará decisiones correctas.

> **Consecuencia práctica**: los IDs únicos (RN-001, INV-003, SK-007) no son burocracia. Son el sistema nervioso que hace trazable cada decisión.

---

## R · Reconstructable
### El sistema completo debe poder reconstruirse leyendo solo las specs.

Este es el test definitivo de una spec Spectra: dale las specs a un agente en un contexto vacío. Sin código existente, sin explicaciones adicionales, sin historial de conversación. ¿Puede reconstruir el sistema idénticamente?

Si sí: las specs son completas.
Si no: hay conocimiento implícito que todavía vive fuera de las specs.

La reconstruibilidad no es un caso de uso exótico. Es el día a día: nuevo agente, nuevo contexto, nueva sesión. Ocurre constantemente.

> **Consecuencia práctica**: escribe las specs como si el lector no tuviera ningún contexto previo. Porque el agente no lo tiene.

---

## A · Agentic
### Diseñado para ser consumido por IA, no por humanos.

Las specs tradicionales están escritas para que un humano las entienda y luego haga algo. Las specs de Spectra están escritas para que una IA las lea y actúe directamente.

Esto cambia todo: el formato, la precisión requerida, la estructura, los IDs, las referencias cruzadas. Un humano puede inferir, contextualizar, preguntar. Un agente no — necesita que todo esté explícito.

Un agente que conoce el dominio completo a través de las specs puede tomar decisiones autónomas correctas. Sin specs, adivina. Con specs incompletas, adivina parcialmente. Con specs Spectra, opera.

> **Consecuencia práctica**: si al leer una spec piensas "esto es obvio, no hace falta escribirlo" — escríbelo. Para el agente, nada es obvio.

---

## Los 7 principios en una frase

> Las specs son la fuente del sistema, describen el dominio de negocio de forma exhaustiva y contractual, constituyen una única verdad desde la que el sistema es reconstruible, y están diseñadas para ser consumidas directamente por agentes de IA.

---

## Lo que Spectra no es

**No es un linter de código.** No analiza tu código ni te dice si está bien escrito.

**No es un generador de código.** Spectra no genera código — da al agente el contexto para que el código que genere sea correcto.

**No es documentación técnica.** Los diagramas de arquitectura, los schemas de base de datos, las decisiones de infraestructura van en otro sitio.

**No es BDD/TDD.** Los criterios de aceptación de Spectra describen comportamiento de negocio, no tests de software. Son la fuente de los tests, no los tests en sí.

**No es un proceso de desarrollo.** Spectra es agnóstico al proceso. Funciona con Agile, con Shape Up, con waterfall, con "vamos a ver qué sale".

---

## Lo que Spectra sí es

Es la infraestructura de conocimiento que un agente necesita para operar solo en un dominio complejo.

Es el artefacto que hace que "dame este cambio" funcione sin que tengas que explicar el contexto cada vez.

Es la diferencia entre un agente que ejecuta y un agente que entiende.

---

*SPECTRA — Source Product Exhaustive Contractual Truth Reconstructable Agentic*
