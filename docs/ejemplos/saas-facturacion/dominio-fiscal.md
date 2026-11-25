# Dominio fiscal — SaaS de facturación e impuestos (autónomos, pymes y despachos)
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Insumo para el prompt maestro: se pega junto a las reglas del catálogo.
> Estado: borrador. Los puntos marcados con ⚠ deben verificarse contra el BOE / AEAT / Agencia Tributaria Canaria antes de usarse como fuente de verdad.

---

## 1. Territorios y familias fiscales

| Territorio | Impuesto indirecto | Notas |
|---|---|---|
| Península y Baleares | IVA | Ley 37/1992 |
| Canarias | IGIC | Sustituye al IVA; liquidación propia (modelo 420) |
| Ceuta y Melilla | IPSI | Fase 2 |
| País Vasco y Navarra | IVA foral | Fuera de alcance de la fase 1 |

**Familia fiscal** = agrupación que decide el tratamiento de una línea: impuesto + tipo + calificación + régimen. Una línea de factura pertenece a una sola familia fiscal.

### 1.1 Familias — península (IVA)
| ID | Familia | Tipo | Ejemplos |
|---|---|---|---|
| FF-IVA-21 | General | 21 % | Servicios profesionales, bienes en general |
| FF-IVA-10 | Reducido | 10 % | Hostelería, transporte de viajeros, ciertos alimentos |
| FF-IVA-04 | Superreducido | 4 % | Pan, leche, huevos, fruta, verdura, libros |
| FF-IVA-00 | Tipo cero | 0 % | Operaciones sujetas con tipo 0 ⚠ |
| FF-IVA-EXE | Exenta | — | Sanidad, educación, seguros (art. 20) |
| FF-IVA-NS | No sujeta | — | Reglas de localización, art. 7 y 14 |
| FF-IVA-ISP | Inversión del sujeto pasivo | según tipo | Construcción, intracomunitario, otros |
| FF-IVA-RE | Recargo de equivalencia | 5,2 % / 1,4 % / 0,5 % ⚠ | Comerciantes minoristas, sobre 21/10/4 |

⚠ Algunos tipos reducidos pueden haber sido modificados por medidas temporales; confirmar vigencia por producto y fecha.

### 1.2 Familias — Canarias (IGIC)
| ID | Familia | Tipo | Ejemplos |
|---|---|---|---|
| FF-IGIC-00 | Exento / tipo cero | 0 % | Bienes de primera necesidad, libros, agua |
| FF-IGIC-03 | Reducido | 3 % | Ropa, calzado |
| FF-IGIC-07 | General | 7 % | Mayoría de bienes y servicios |
| FF-IGIC-095 | Incrementado | 9,5 % | Vehículos, medios de transporte |
| FF-IGIC-15 | Incrementado | 15 % | Alcohol, perfumería, joyería ⚠ |
| FF-IGIC-20 | Especial | 20 % / 35 % tabaco ⚠ | Tabaco |
| FF-IGIC-MIN | Régimen de minoristas | según régimen | Equivalente canario al recargo |

⚠ Una fuente secundaria mostraba un 13,5 % en una tabla y 15 % en el texto: validar la tabla oficial de la Agencia Tributaria Canaria. ⚠ Hay tipos temporales en 2026 (energía, gas): modelar el tipo con **vigencia por fechas**.

### 1.3 Retenciones (IRPF), independientes del territorio
| ID | Retención | Tipo habitual |
|---|---|---|
| RET-PROF | Profesionales | 15 % |
| RET-PROF-NUEVO | Nuevos profesionales (3 primeros años) | 7 % |
| RET-ALQ | Alquiler de inmuebles urbanos | 19 % |
| RET-NINGUNA | Sin retención | 0 % |

Las retenciones son un tributo estatal: se aplican igual en Canarias.

---

## 2. Códigos de registro de facturación (VeriFactu)

### 2.1 Tipo de factura
| Código | Significado |
|---|---|
| F1 | Factura completa |
| F2 | Factura simplificada |
| F3 | Factura emitida en sustitución de simplificada |
| R1 | Rectificativa (art. 80.1, 80.2 y 80.6) |
| R2 | Rectificativa (art. 80.3, concurso) |
| R3 | Rectificativa (art. 80.4, incobrables) |
| R4 | Rectificativa, otros |
| R5 | Rectificativa de facturas simplificadas |

### 2.2 Calificación de la operación
| Código | Significado |
|---|---|
| S1 | Sujeta y no exenta, sin inversión del sujeto pasivo |
| S2 | Sujeta y no exenta, con inversión del sujeto pasivo |
| N1 | No sujeta (art. 7, 14 y otros) |
| N2 | No sujeta por reglas de localización |

### 2.3 Causa de exención
| Código | Significado |
|---|---|
| E1 | Art. 20 — exenciones interiores |
| E2 | Art. 21 — exportaciones |
| E3 | Art. 22 — asimiladas a exportación |
| E4 | Art. 23 y 24 — depósitos y regímenes aduaneros |
| E5 | Art. 25 — entregas intracomunitarias |
| E6 | Otras causas |

### 2.4 Clave de régimen (resumen)
01 general · 02 exportación · 03 bienes usados/arte · 04 oro de inversión · 05 agencias de viajes · 07 criterio de caja · 08 régimen distinto · 10 cobro por cuenta de terceros · 11 arrendamiento de locales · 14/15 devengo pendiente · 17 OSS/IOSS (IVA) o minoristas (IGIC) · 18 recargo de equivalencia (IVA) o pequeños comerciantes (IGIC) · 19 agricultura, ganadería y pesca · 20 régimen simplificado.

### 2.5 Código de impuesto
⚠ A verificar contra el esquema oficial de la AEAT: IVA, IPSI e IGIC se distinguen con un código de impuesto en cada desglose. Esta spec no fija los valores numéricos hasta confirmarlos.

---

## 3. Entidades del dominio

| ID | Entidad | Contenido clave |
|---|---|---|
| ENT-01 | Obligado tributario (empresa o autónomo) | NIF, razón social, territorio fiscal (IVA/IGIC), régimen de IVA, IRPF/IS, periodicidad (trimestral/mensual), actividad |
| ENT-02 | Actividad | CNAE / epígrafe IAE, fecha de alta, tipo de actividad (empresarial/profesional) |
| ENT-03 | Serie de facturación | Prefijo, contador correlativo sin saltos, ámbito (ordinarias, rectificativas, simplificadas) |
| ENT-04 | Cliente (customer) | NIF/NIF-IVA/pasaporte, país, tipo (empresa/particular), régimen (recargo, ISP), dirección fiscal, forma de pago |
| ENT-05 | Proveedor (supplier) | Igual que cliente, más validación de NIF y país de residencia fiscal |
| ENT-06 | Producto / servicio | Familia fiscal por defecto, unidad, precio, cuenta contable, exención aplicable |
| ENT-07 | Familia fiscal | Impuesto, tipo, calificación, régimen, **vigencia desde/hasta** |
| ENT-08 | Factura emitida | Cabecera, líneas, desglose por familia, retenciones, recargo, vencimientos |
| ENT-09 | Línea de factura | Producto, cantidad, base, familia fiscal, descuento |
| ENT-10 | Factura recibida | Nº de recepción correlativo, fecha de expedición, fecha de operación, proveedor, base/tipo/cuota, cuota deducible |
| ENT-11 | Factura rectificativa | Referencia a la original, motivo, tipo R1–R5, importes rectificados |
| ENT-12 | Cobro / pago | Importe, fecha, medio, factura asociada |
| ENT-13 | Registro de facturación | Huella encadenada, QR, estado de envío, vínculo con la factura |
| ENT-14 | Libro registro | Facturas emitidas, recibidas, bienes de inversión |
| ENT-15 | Liquidación periódica | Modelo (303, 420, 111, 130…), periodo, resultado, estado |
| ENT-16 | Despacho y cliente del despacho | Un despacho gestiona varias empresas con permisos por rol |

---

## 4. Flujo de facturas emitidas
1. Elegir cliente y serie.
2. Añadir líneas: cada producto trae su familia fiscal por defecto.
3. **Resolver la familia fiscal definitiva** según territorio del emisor, territorio y país del cliente, régimen del cliente (recargo, inversión del sujeto pasivo) y fecha de la operación.
4. Calcular: base, cuota por familia, recargo, retención; total = bases + cuotas + recargo − retención.
5. Emitir: asignar número correlativo, generar el registro de facturación (huella, QR) y bloquear la edición.
6. Anotar en el libro de emitidas.
7. Registrar el cobro y actualizar el saldo del cliente.
8. Incluir la factura en la liquidación del periodo (303 en península, 420 en Canarias).

Corrección posterior: solo mediante factura rectificativa (R1–R5).

## 5. Flujo de facturas recibidas
1. Captura: subida de archivo, correo, factura electrónica o alta manual.
2. Identificar al proveedor (alta si no existe) y validar el NIF.
3. Extraer fecha de expedición, fecha de operación, bases, tipos, cuotas y retenciones.
4. **Clasificar fiscalmente** cada línea: familia fiscal, ¿inversión del sujeto pasivo?, ¿adquisición intracomunitaria?
5. **Decidir la deducibilidad**: cuota deducible total, parcial (prorrata, afectación parcial) o no deducible.
6. Asignar nº de recepción correlativo y anotar en el libro de recibidas: nº de recepción, fecha de expedición, fecha de operación si difiere, proveedor y NIF, base, tipo, cuota y cuota deducible.
7. Contabilizar y programar el pago.
8. Incluir en la liquidación del periodo.

Reglas del libro de recibidas (AEAT): asiento resumen solo para facturas del mismo día y proveedor con total sin IVA hasta 6.000 € y hasta 500 € cada una; una factura con varios tipos se anota en varios asientos correlativos.

---

## 6. Modelos y periodicidad (resumen)
| Obligación | Península | Canarias |
|---|---|---|
| Liquidación trimestral indirecta | 303 | 420 |
| Resumen anual indirecta | 390 | 425 |
| Retenciones de trabajo y profesionales | 111 (trimestral) | 111 (trimestral) |
| Retención de alquileres | 115 | 115 |
| Pago fraccionado IRPF | 130 / 131 | 130 / 131 |
| Operaciones con terceros > 3.005,06 € | 347 | 347 |
| Operaciones intracomunitarias | 349 | 349 ⚠ |

⚠ Plazos, umbrales y obligatoriedad por régimen deben confirmarse; el MVP solo calcula el resumen del 303 / 420 y no presenta ante la Administración.

---

## 7. Invariantes propuestas
- **INV-F01**: total de factura = suma de bases + cuotas + recargo − retención.
- **INV-F02**: la numeración de cada serie es correlativa y sin saltos.
- **INV-F03**: una factura emitida no se modifica; solo se rectifica.
- **INV-F04**: toda rectificativa referencia a una factura original existente.
- **INV-F05**: una línea no puede mezclar IVA e IGIC.
- **INV-F06**: el tipo aplicado debe existir en la familia fiscal vigente en la fecha de la operación.
- **INV-F07**: la cuota deducible nunca supera la cuota soportada.
- **INV-F08**: el nº de recepción de recibidas es correlativo.
- **INV-F09**: cada factura emitida tiene exactamente un registro de facturación encadenado.

## 8. Fuentes consultadas
- AEAT — Libro registro de facturas recibidas (sede.agenciatributaria.gob.es).
- GOBL — Spain VERI*FACTU V1 (docs.gobl.org/addons/es-verifactu-v1): códigos de tipo, calificación, exención y régimen.
- Quipu — Tipos de IGIC (getquipu.com/blog/tipos-igic): tipos de IGIC y modelos 420/425 (fuente secundaria con incoherencias señaladas arriba).
