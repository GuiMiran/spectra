# 06-politicas — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

## POL-K01 — Subcuenta de impuesto según territorio y familia fiscal
SI el emisor tributa en Península o Baleares ENTONCES la subcuenta es de 477 (repercutido) o 472 (soportado) para IVA, por tipo.
SI_NO SI tributa en Canarias ENTONCES se usa la subcuenta propia de IGIC dentro de 477 o 472 ⚠.
SI_NO SI es foral (País Vasco o Navarra) ENTONCES se usan las mismas cuentas con el IVA foral, y se conserva su territorio para los modelos.

| Territorio | Impuesto | Repercutido | Soportado |
|---|---|---|---|
| Península y Baleares | IVA | 477 + subcuenta por tipo | 472 + subcuenta por tipo |
| Canarias | IGIC | 477 + subcuenta de IGIC por tipo ⚠ | 472 + subcuenta de IGIC por tipo ⚠ |
| País Vasco, Navarra | IVA foral | 477 + subcuenta | 472 + subcuenta |
| Ceuta y Melilla | IPSI | Fase 2 | Fase 2 |

## POL-K02 — Plantilla de asiento según evento
| Evento de origen | Plantilla |
|---|---|
| `FacturaEmitida` | PLA-K01 |
| `FacturaRecibidaRegistrada` | PLA-K02 (con inversión del sujeto pasivo: PLA-K03) |
| `CobroRegistrado` / `PagoRegistrado` | PLA-K04 |
| `FacturaRectificada` | PLA-K05 |
| `LiquidacionPreparada` | PLA-K06 |
| Presentación de retenciones | PLA-K07 |
| Cierre de ejercicio | PLA-K08 (fase 1 mínima) |

## POL-K03 — Cuenta de retención
SI la empresa **factura** con retención ENTONCES se carga 473 (retención soportada).
SI_NO SI la empresa **recibe** una factura de un profesional o arrendador con retención ENTONCES se abona 4751 (retención practicada).

## POL-K04 — Deducibilidad del impuesto soportado
SI la cuota es totalmente deducible ENTONCES todo va a 472.
SI_NO SI es parcialmente deducible (prorrata o afectación parcial) ENTONCES la parte deducible a 472 y el resto se suma al gasto o a la inversión.
SI_NO SI no es deducible ENTONCES toda la cuota se suma al gasto.

## POL-K05 — Cuenta de ingreso o gasto
SI el producto tiene extensión contable ENTONCES se usa su cuenta.
SI_NO SI no la tiene ENTONCES se usa la cuenta por defecto de su familia y se avisa (RN-K22).
SI_NO SI el apunte es de un producto de inversión ENTONCES la cuenta es del grupo 2.

## POL-K06 — Momento de contabilización
SI la empresa usa el criterio por defecto ENTONCES la fecha del asiento es la de devengo.
SI_NO SI se activa criterio de caja (fase 2) ENTONCES el impuesto se contabiliza al cobro o pago.

## POL-K07 — Periodo cerrado
SI la fecha del evento cae en un periodo cerrado ENTONCES no se crea asiento y se abre incidencia con la opción de reabrir o imputar al periodo abierto.
SI_NO se contabiliza con normalidad.

## POL-K08 — Tickets de TPV
SI el evento es venta con ticket ENTONCES se acumula en el resumen diario de la caja.
SI_NO SI es factura completa ENTONCES asiento individual.

## POL-K09 — Modalidad de autónomo
SI la modalidad es contabilidad mercantil ENTONCES se generan asientos y se usa 550 para el titular.
SI_NO SI es solo libros registro ENTONCES no se generan asientos y los informes contables no se ofrecen.

## POL-K10 — Licencia
SI la licencia está activa ENTONCES opera con normalidad.
SI_NO SI está suspendida ENTONCES solo lectura y exportación.
SI_NO SI venció ENTONCES solo exportación durante el plazo de gracia.

## POL-K11 — Resultado de la liquidación
SI repercutido − soportado es positivo ENTONCES se lleva a 4750 (a ingresar).
SI_NO SI es negativo ENTONCES se lleva a 4700 (a devolver o compensar).
SI_NO SI es cero ENTONCES solo se cancelan 477 y 472.
