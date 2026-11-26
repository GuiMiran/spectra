# SPEC-INDEX — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

## Mapa
| Capa | Archivo | IDs |
|---|---|---|
| 00 | [00-index](00-index.md) | DEC-K01..K06 |
| 01 | [01-glosario](01-glosario.md) | términos |
| 02 | [02-historias](02-historias.md) | HU-K01..K24 |
| 03 | [03-reglas-negocio](03-reglas-negocio.md) | RN-K01..K26 |
| 04 | [04-invariantes](04-invariantes.md) | INV-K01..K16 |
| 05 | [05-contratos](05-contratos.md) | CT-K01..K09 |
| 06 | [06-politicas](06-politicas.md) | POL-K01..K11 |
| 07 | [07-eventos](07-eventos.md) | EVT-K01..K07 |
| 08 | [08-agentes](08-agentes.md) | AG-K01..K06 |
| 09 | [09-skills](09-skills.md) | SK-K01..K13 |
| 10 | [10-workflows](10-workflows.md) | WF-K01..K09 |
| 11 | [11-criterios-aceptacion](11-criterios-aceptacion.md) | AC-K01..K24 |
| 12 | [12-trace](12-trace.md) | tabla Spec→Código |

Contexto: [dominio-contable.md](../dominio-contable.md) (dominio) y [core-contratos.md](../../plataforma-modular/core-contratos.md) (core).

## Referencias cruzadas
- Facturación → Contabilidad: EV-F01..F05 → WF-K01, K02, K03, K06 → PLA-K01..K06.
- Core → Contabilidad: EV-C05..C08 → AG-K05, WF-K07, POL-K10.
- Flujo principal: evento → AG-K01 → SK-K03, K04, K01, K02 → EVT-K01 → AG-K02 → SK-K09 → AG-K03 → SK-K10.

## Convenciones
- Sufijo `-K` = Contabilidad. Los de Facturación llevan `-F` y los del core `-C`.
- ⚠ = dato fiscal sin verificar. Una IA no lo trata como verdad: pide confirmación.
- Los importes de los ejemplos son ilustrativos.
- No se mencionan productos comerciales de terceros; las fuentes son normativa pública.

## Cómo consumir esta spec (IA agéntica)
1. Lee 00-index y las decisiones DEC-K01..K06 (están cerradas como propuesta, modificables).
2. Lee glosario, reglas, invariantes y políticas antes de generar nada.
3. Implementa contratos y skills; las invariantes se convierten en comprobaciones automáticas.
4. Implementa workflows y agentes sobre las skills.
5. Usa los AC como pruebas y rellena 12-trace.
6. No inventes tipos impositivos, cuentas ni plazos: si falta o hay ⚠, pregunta.

## Pendiente de revisión por persona experta
Tabla de tipos y subcuentas de IGIC, recargo de equivalencia, contabilización de rectificativas R1–R5, forales (incluida Navarra) y plazo de conservación de libros.
