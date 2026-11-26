# 07-eventos — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

| ID | Evento | Dispara |
|---|---|---|
| EV-F01 | FacturaEmitida | Contabilidad (asiento PLA-K01), libro de emitidas, remisión VeriFactu, saldo del cliente |
| EV-F02 | FacturaRectificada | Contabilidad (PLA-K05), libro, remisión, saldo |
| EV-F03 | FacturaRecibidaRegistrada | Contabilidad (PLA-K02/K03), libro de recibidas |
| EV-F04 | CobroRegistrado / PagoRegistrado | Contabilidad (PLA-K04), saldo del tercero |
| EV-F05 | LiquidacionPreparada | Contabilidad (PLA-K06) |
| EV-F06 | FacturaVencida | Aviso al usuario, antigüedad de saldos |
| EV-F07 | RegistroFacturacionRemitido | Estado de envío |
| EV-F08 | RegistroFacturacionRechazado | Incidencia y aviso |
| EV-F09 | IncidenciaFacturacion | Tarea al responsable |

Consume del core: EV-C01, C03, C04, C05, C06, C07, C08.
Datos mínimos de EV-F01..F05: ver contrato en dominio-contable §7.1.
