# 00-index — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

## Alcance
Facturación es la horizontal que **emite facturas, registra las recibidas, lleva los libros registro de IVA/IGIC, cobros y pagos, y prepara las liquidaciones**. Es dueña de la **Factura** y del **Registro de facturación** (VeriFactu). No lleva contabilidad: la hace Contabilidad a partir de sus eventos.
- Depende del core: empresas, terceros, productos, familias fiscales, periodos y licencias (CE-02, CE-05, CE-06, CE-07, CE-08, CE-10).
- Produce: EV-F01..F05 (ya consumidos por Contabilidad) y los nuevos EV-F06..F09.
- No incluye: contabilidad, nóminas, presentación telemática ante la AEAT (el MVP **prepara**, no presenta), IPSI (fase 2), forales (fuera de fase 1).
- **Factura Lite** no vive aquí: es el Registro de factura de Contabilidad. Con Facturación activa, ese alta manual se bloquea (RN-K28).

## Dispatch
| Capa | Archivo | IDs |
|---|---|---|
| 01 | 01-glosario | términos |
| 02 | 02-historias | HU-F01..F24 |
| 03 | 03-reglas-negocio | RN-F01..F28 |
| 04 | 04-invariantes | INV-F01..F14 |
| 05 | 05-contratos | CT-F01..F08 |
| 06 | 06-politicas | POL-F01..F10 |
| 07 | 07-eventos | EV-F01..F09 |
| 08 | 08-agentes | AG-F01..F06 |
| 09 | 09-skills | SK-F01..F14 |
| 10 | 10-workflows | WF-F01..F09 |
| 11 | 11-criterios-aceptacion | AC-F01..F24 |
| 12 | 12-trace | tabla |

## Decisiones abiertas (cerradas como propuesta, modificables)
- **DEC-F01:** modalidad VeriFactu por defecto = verificable (remisión a la AEAT) ⚠ fechas de obligatoriedad por confirmar en BOE.
- **DEC-F02:** una serie ordinaria, una de rectificativas y una de simplificadas por empresa; más series a petición.
- **DEC-F03:** factura simplificada solo dentro de los límites legales ⚠ (verificar importes y sectores).
- **DEC-F04:** factura electrónica B2B: formato y plazos según RD 238/2026 ⚠ por confirmar; MVP genera el documento y deja el envío a fase 2.
- **DEC-F05:** captura de recibidas en MVP = alta manual + subida de archivo; lectura automática en fase 2.
- **DEC-F06:** el MVP prepara los modelos (303/420 y resumen), no los presenta.
