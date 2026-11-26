# 11-criterios-aceptacion — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**AC-F01** (HU-F01, RN-F03, INV-F01) DADO 1.000 € con IVA 21 % y retención 15 % CUANDO emito ENTONCES total 1.060 €, cuota 210 €, retención 150 €.
**AC-F02** (HU-F02, POL-F01) ⚠ DADO un emisor en Canarias y producto general CUANDO emito ENTONCES IGIC 7 % y total 1.070 € sobre 1.000 €.
**AC-F03** (HU-F01, RN-F02) DADO las facturas 1 a 10 CUANDO emito la siguiente ENTONCES es la 11, sin saltos.
**AC-F04** (HU-F01, RN-F01) DADO una emitida CUANDO intento editarla ENTONCES se impide y se ofrece rectificar.
**AC-F05** (HU-F04) ⚠ DADO cliente con recargo y 1.000 € al 21 % CUANDO emito ENTONCES recargo 52 € ⚠.
**AC-F06** (HU-F05, RN-F08) DADO ISP CUANDO emito ENTONCES no hay cuota repercutida y consta la leyenda.
**AC-F07** (HU-F06, RN-F07) ⚠ DADO una venta por encima del límite simplificado CUANDO intento simplificada ENTONCES se exige completa.
**AC-F08** (HU-F07, RN-F11) DADO una rectificativa sin original CUANDO se guarda ENTONCES se rechaza.
**AC-F09** (HU-F07) DADO una emitida de 1.000 € CUANDO se rectifica por el total ENTONCES saldo y libros quedan en cero.
**AC-F10** (HU-F08, RN-F13, INV-F08) DADO 5 recibidas CUANDO registro la sexta ENTONCES su nº de recepción es el 6.
**AC-F11** (HU-F09, RN-F14) DADO cuota soportada de 210 € CUANDO indico deducible 300 € ENTONCES se rechaza.
**AC-F12** (HU-F09, POL-F06) DADO afectación del 50 % CUANDO registro ENTONCES deducible 105 € de 210 €.
**AC-F13** (HU-F10, INV-F12) DADO factura de 1.060 € CUANDO cobro 1.060 € ENTONCES saldo 0.
**AC-F14** (HU-F10, CT-F04) DADO saldo 500 € CUANDO intento cobrar 600 € ENTONCES se rechaza.
**AC-F15** (HU-F13, INV-F10) DADO una emitida CUANDO consulto el libro ENTONCES aparece.
**AC-F16** (HU-F16, INV-F11) DADO un trimestre CUANDO preparo el 303 ENTONCES repercutido y soportado coinciden con los libros.
**AC-F17** (HU-F16, POL-F07) DADO Canarias CUANDO preparo ENTONCES el modelo es el 420.
**AC-F18** (HU-F19, RN-F26) DADO un periodo cerrado CUANDO emito con fecha dentro ENTONCES se rechaza.
**AC-F19** (HU-F20, INV-F09) DADO una emitida CUANDO se genera su registro ENTONCES hay exactamente uno, encadenado al anterior.
**AC-F20** (HU-F21, RN-F24) DADO un registro rechazado CUANDO ocurre ENTONCES hay incidencia y el cobro sigue permitido.
**AC-F21** (HU-F23, RN-F25) DADO licencia vencida CUANDO intento emitir ENTONCES no se permite pero se pueden exportar los datos.
**AC-F22** (HU-F12, EV-F06) DADO una factura vencida CUANDO se ejecuta el proceso ENTONCES se avisa.
**AC-F23** (HU-F24) DADO una rectificación CUANDO consulto la auditoría ENTONCES consta quién y cuándo.
**AC-F24** (INV-F14, INV-K17) DADO un tenant con Facturación CUANDO se intenta el alta manual de un Registro en Contabilidad ENTONCES se bloquea.
