# 00-index — Módulo Proyectos y horas (H-08)
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

## Alcance
Horizontal que **mide el tiempo y el esfuerzo del despacho por cliente y servicio**, para saber qué cliente es rentable. Es dueña de: servicio, encargo, parte de horas, presupuesto de horas, plazo y aprobación. No factura (propone honorarios a Facturación) y no lleva nóminas.
- Depende del core: despacho, empresa, usuario y rol, honorario pactado (CE-17), coste hora (CE-19), uso y tarifa de coste (CE-13, CE-14), periodos y licencias.
- Alimenta: la vista de rentabilidad por cliente del core (§8) y, opcionalmente, Facturación.
- Fuera de alcance: control de jornada laboral legal (es de Nóminas / RR. HH. ⚠), gestión de proyectos de software, gestión de gastos.

## Dispatch
| Capa | IDs |
|---|---|
| 02 historias | HU-H01..H26 |
| 03 reglas | RN-H01..H28 |
| 04 invariantes | INV-H01..H12 |
| 05 contratos | CT-H01..H09 |
| 06 políticas | POL-H01..H10 |
| 07 eventos | EV-H01..H10 |
| 08 agentes | AG-H01..H06 |
| 09 skills | SK-H01..H14 |
| 10 workflows | WF-H01..H09 |
| 11 criterios | AC-H01..H24 |

## Decisiones (propuesta, modificables)
- **DEC-H01:** unidad de registro = minutos; se muestra y factura en incrementos configurables (por defecto 6 min).
- **DEC-H02:** la referencia de ingreso para rentabilidad = honorario **facturado y cobrado**, con vista alternativa por pactado.
- **DEC-H03:** cada parte de horas pertenece a un encargo (empresa + servicio); lo no imputable va a "interno".
- **DEC-H04:** aprobación de partes opcional por rol; por defecto, el responsable aprueba cada semana.
- **DEC-H05:** el coste hora se fija por rol con vigencia; el coste real por persona es opcional y de acceso restringido (dato laboral sensible).
- **DEC-H06:** el MVP no integra temporizador de escritorio; solo entrada manual y temporizador en pantalla.
