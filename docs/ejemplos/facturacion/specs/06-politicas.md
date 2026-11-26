# 06-politicas — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**POL-F01 — Familia fiscal definitiva.** SI el emisor tributa en Canarias ENTONCES IGIC por la familia del producto. SI_NO SI el cliente es de otro país de la UE con NIF-IVA válido y la operación es entrega de bienes ENTONCES exenta intracomunitaria ⚠. SI_NO SI el cliente tiene régimen de inversión ENTONCES ISP. SI_NO la del producto por defecto.
**POL-F02 — Recargo.** SI el cliente está en recargo de equivalencia ENTONCES se añade sobre la cuota ⚠ (5,2 % / 1,4 % / 0,5 %). SI_NO no.
**POL-F03 — Retención.** SI el emisor es profesional y el cliente es empresa ENTONCES RET-PROF (15 %, o 7 % si es nuevo profesional). SI_NO RET-NINGUNA.
**POL-F04 — Simplificada.** SI el importe está dentro del límite ⚠ ENTONCES se permite simplificada. SI_NO completa.
**POL-F05 — Tipo de rectificativa.** SI error en datos o cálculo ENTONCES R1 ⚠. SI_NO SI concurso ENTONCES R2. SI_NO SI incobrable ENTONCES R3. SI_NO R4; SI es simplificada ENTONCES R5.
**POL-F06 — Deducibilidad.** SI gasto afecto totalmente ENTONCES cuota deducible total. SI_NO SI afectación parcial o prorrata ENTONCES parcial. SI_NO nula.
**POL-F07 — Modelo de liquidación.** SI Canarias ENTONCES 420. SI_NO 303.
**POL-F08 — Remisión.** SI modalidad verificable ENTONCES remitir al emitir. SI_NO guardar para exhibir a requerimiento ⚠.
**POL-F09 — Periodo cerrado.** SI la fecha cae en periodo cerrado ENTONCES rechazar y avisar.
**POL-F10 — Licencia.** Activa: normal. Suspendida: solo lectura y exportación. Vencida: solo exportación en plazo de gracia.
