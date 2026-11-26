# Core: ficha de la entidad legal y cómo la usan los módulos
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador v0.5. Amplía CE-02 (Empresa) del [core](core-contratos.md). ⚠ = por verificar contra BOE / AEAT / Hacienda foral. Fuentes consultadas al final.

## 1. Principios
- **P-01:** el core es la única fuente de los datos de la empresa. Los módulos los **consultan y reaccionan a sus cambios**; nunca los copian ni los editan.
- **P-02:** todo dato que cambia con el tiempo lleva **vigencia desde / hasta**. Una factura de 2025 se calcula con los datos que valían en 2025, aunque la empresa haya cambiado de domicilio o de territorio después.
- **P-03:** el despacho da de alta y mantiene la ficha; el módulo que la necesita solo la lee.
- **P-04:** un dato que usan dos módulos o más vive en el core (regla de ≥ 2 módulos).

## 2. Tipo de entidad (forma jurídica)
El tipo decide el impuesto, el tipo de contabilidad y los datos que se piden al dar de alta.

| Tipo | Persona | Impuesto sobre la renta | Contabilidad | Datos propios al alta |
|---|---|---|---|---|
| Autónomo (empresario individual) | Física | IRPF | Mercantil o solo libros registro, según actividad y opción (RN-K25) ⚠ | Fecha de alta, epígrafe IAE, régimen (estimación directa u objetiva) ⚠ |
| Sociedad limitada (SL) y unipersonal (SLU) | Jurídica | Impuesto sobre Sociedades | Mercantil, obligatoria | Capital (mínimo 1 € tras la ley Crea y Crece), escritura, socios, administradores, ejercicio social |
| Sociedad anónima (SA) | Jurídica | Impuesto sobre Sociedades | Mercantil, obligatoria | Capital (mínimo 60.000 €, con al menos el 25 % desembolsado), órganos |
| Cooperativa | Jurídica | Impuesto sobre Sociedades, con régimen especial ⚠ | Mercantil | Mínimo de socios, estatutos |
| Comunidad de bienes y sociedad civil | Sin personalidad (entes en atribución de rentas) | Atribuyen la renta a sus socios (IRPF o IS de cada uno) ⚠ | Libros registro o mercantil, según la naturaleza ⚠ | NIF de la entidad, socios y porcentajes |
| Asociación y fundación | Jurídica | Impuesto sobre Sociedades parcialmente exento ⚠ | Plan específico ⚠ | Registro propio, estatutos |
| UTE y otras | Jurídica o ente | Según el caso ⚠ | Según el caso ⚠ | Registro especial |

Fuera de la fase 1: entidades extranjeras con establecimiento permanente, grupos fiscales y consolidación.

## 3. Entidades del core (ampliación)

### 3.1 CE-02 Empresa (ampliada)
| Campo | Notas |
|---|---|
| NIF, razón social, nombre comercial | NIF validado; el nombre comercial es opcional |
| **Tipo de entidad** | Catálogo de la sección 2 |
| **Territorio fiscal** | Ver sección 4 |
| Régimen de IVA o IGIC, periodicidad | Con vigencia |
| **Fecha de constitución o de alta** | Para sociedades, la de constitución; para autónomos, la de alta censal |
| Estado | Activa, en baja, en liquidación |
| Cliente del despacho desde | Fecha, persona responsable en el despacho (CE-04) |

### 3.2 Entidades nuevas
| ID | Entidad | Contenido clave | Vigencia |
|---|---|---|---|
| CE-20 | **Cuenta bancaria de tercero** | Tercero, IBAN validado, titular, principal | Sí (propuesta de DEC-T01 de Tesorería) |
| CE-21 | **Domicilio** | Empresa, tipo (fiscal, social, centro de trabajo), dirección, municipio, provincia, código postal | Sí. Solo un domicilio fiscal vigente a la vez |
| CE-22 | **Actividad** | Empresa, CNAE, epígrafe IAE, tipo (empresarial, profesional, artística), fecha de alta y baja, principal o secundaria | Sí. Varias a la vez |
| CE-23 | **Representante** | Empresa, persona (tercero), cargo (administrador único, solidario, mancomunado, apoderado…), facultades, fecha de nombramiento y cese | Sí |
| CE-24 | **Obligación fiscal** | Empresa, modelo, periodicidad (mensual, trimestral, anual), régimen, vigencia | Sí. Se deriva del tipo, el territorio y el régimen |
| CE-08 | **Ejercicio y periodo** (ampliado) | Empresa, fecha de inicio y de fin del ejercicio, estado | El ejercicio es por empresa, no por calendario fijo |

El **ejercicio** de una empresa puede no coincidir con el año natural y el primero puede ser más corto. Contabilidad, Facturación y Fiscal usan las mismas fechas ⚠ (reglas del ejercicio social).

## 4. Territorio fiscal
El territorio decide qué impuesto, qué administración y qué normativa. Se guarda por empresa y con vigencia.

| Territorio | Impuesto indirecto | Administración | Notas |
|---|---|---|---|
| Común (península y Baleares) | IVA | AEAT | Modelo 303 |
| Canarias | IGIC | Agencia Tributaria Canaria | Modelo 420. Impuesto sobre Sociedades estatal con incentivos propios (RIC, ZEC) ⚠ |
| Álava, Bizkaia, Gipuzkoa | IVA foral | Diputación foral | Normativa propia; TicketBAI y Batuz según territorio ⚠ |
| Navarra | IVA foral | Hacienda Foral de Navarra | Convenio Económico ⚠ |
| Ceuta y Melilla | IPSI | Administraciones locales | Fase 2 |

**Entidades que operan en varios territorios.** Si el volumen de operaciones del ejercicio anterior supera 10 millones de euros y opera en territorio común y foral, se aplica el régimen de tributación conjunta. El reparto de pagos fraccionados sigue la proporción de operaciones de cada territorio. Si el domicilio es foral, además, se mira si al menos el 75 % de las operaciones fueron en territorio común. ⚠ Umbrales y reglas según la AEAT; confirmar vigencia.

Se guardan tres datos distintos, porque pueden no coincidir: **territorio del impuesto indirecto**, **territorio del impuesto sobre la renta** y **proporción de operaciones por territorio** (para tributación conjunta).

## 5. Contrato de lectura (cómo consumen los módulos)
Los módulos acceden a la ficha de dos maneras, en consonancia con la regla de que solo se hablan por eventos y contratos.

| ID | Operación | Entrada | Salida |
|---|---|---|---|
| CT-C01 | **consultar_empresa** | empresa, fecha | Ficha completa vigente en esa fecha (tipo, territorio, régimen, domicilio fiscal, actividades, representantes, obligaciones, ejercicio) |
| CT-C02 | **consultar_obligaciones** | empresa, periodo | Modelos y periodicidad aplicables |
| CT-C03 | **consultar_ejercicio** | empresa, fecha | Fechas del ejercicio y estado |
| CT-C04 | **consultar_representantes** | empresa, fecha | Quién puede firmar o presentar |

Reglas del contrato:
- La consulta devuelve **siempre los datos con la vigencia pedida**, nunca "los de hoy" si se pide una fecha pasada.
- Un módulo puede guardar una copia de lectura con el identificador de versión, pero no la modifica.
- Si la consulta falla, el módulo no asume valores por defecto: bloquea la operación y avisa.

## 6. Eventos nuevos del core
| ID | Evento | Cuándo | Quién reacciona |
|---|---|---|---|
| EV-C12 | EmpresaModificada | Cambia un dato de la ficha | Todos los módulos activos |
| EV-C13 | TerritorioFiscalCambiado | Cambia territorio o régimen | Facturación (familias y modelos), Contabilidad (subcuentas), Fiscal |
| EV-C14 | EjercicioDefinido / EjercicioCerrado | Se abre o cierra un ejercicio | Contabilidad, Facturación, Fiscal, Nóminas |
| EV-C15 | ActividadAltaBaja | Se añade o retira una actividad | Facturación (retenciones, epígrafe), Nóminas (convenio), Fiscal |
| EV-C16 | RepresentanteCambiado | Alta o cese de administrador o apoderado | Fiscal (quién presenta), Tesorería (quién firma pagos), Nóminas |
| EV-C17 | DomicilioCambiado | Cambia el domicilio fiscal | Facturación (nuevas facturas), Fiscal |

## 7. Qué usa cada módulo
| Módulo | Qué lee de la ficha | Para qué |
|---|---|---|
| **Facturación** | NIF, razón social, domicilio fiscal y de emisión, territorio, régimen de IVA o IGIC, recargo, actividad | Datos del emisor en la factura, familia fiscal, retención de profesionales, modelo de liquidación |
| **Contabilidad** | Tipo de entidad, ejercicio, territorio, modalidad (autónomo), plantilla de plan | Plan de cuentas (cuentas de capital solo en sociedades), apertura y cierre del ejercicio, subcuentas de IVA o IGIC |
| **Nóminas** | Domicilio de los centros de trabajo, actividad (CNAE), representante legal, código de cuenta de cotización | Contratos, convenio, firma y presentación |
| **Tesorería** | Representantes con facultades de firma, cuentas bancarias | Quién puede aprobar pagos y remesas |
| **Fiscal** | Obligaciones, periodicidad, régimen, representantes, tributación conjunta | Calendario de modelos y quién presenta |
| **Proyectos y horas** | Actividad, tipo de entidad | Servicios típicos por cliente |

## 8. Alta guiada por tipo
El despacho da de alta una empresa con un asistente que pide los datos según el tipo:
1. **Identidad:** NIF, nombre, tipo de entidad, fecha de alta o constitución.
2. **Territorio y régimen.**
3. **Domicilios.**
4. **Actividades** (una o varias).
5. **Representantes** (obligatorio en sociedades; el titular en autónomos).
6. **Ejercicio:** fechas de inicio y fin.
7. **Obligaciones:** se proponen según tipo, territorio y régimen y el despacho las confirma.
8. **Licencias** de los módulos que contrata.

## 9. Reglas e invariantes
- **RN-C01:** el tipo de entidad es obligatorio y decide el catálogo de campos requeridos.
- **RN-C02:** una empresa tiene un único domicilio fiscal vigente en cada fecha.
- **RN-C03:** una empresa tiene al menos una actividad vigente para emitir facturas.
- **RN-C04:** una sociedad tiene al menos un administrador vigente.
- **RN-C05:** el ejercicio no se solapa con otro de la misma empresa.
- **RN-C06:** un cambio de territorio o de régimen no modifica documentos ya emitidos; rige desde su fecha de efecto.
- **RN-C07:** las obligaciones fiscales se proponen, no se imponen: las confirma una persona del despacho.
- **INV-C19:** toda ficha cumple los campos requeridos de su tipo.
- **INV-C20:** los datos con vigencia nunca dejan huecos ni solapes para un mismo atributo.
- **INV-C21:** ningún módulo escribe en la ficha.
- **INV-C22:** el territorio del impuesto indirecto es coherente con el domicilio fiscal, salvo entidades con tributación conjunta ⚠.

## 10. Decisiones abiertas (propuesta, modificables)
- **DEC-C06:** el tipo de entidad es un catálogo cerrado en la fase 1 (autónomo, SL, SLU, SA, cooperativa, comunidad de bienes, sociedad civil, asociación).
- **DEC-C07:** el ejercicio por defecto es el año natural; otro ejercicio exige confirmación.
- **DEC-C08:** las obligaciones se derivan por reglas; el despacho puede añadir o quitar.
- **DEC-C09:** el volumen de operaciones y la proporción por territorio los introduce el despacho a mano en la fase 1.

## 11. Sin verificar
Capitales y obligaciones registrales, régimen de cooperativas, asociaciones y entes sin personalidad, tributación en Canarias (RIC, ZEC), reglas de Navarra y de los territorios forales, ejercicios irregulares y cualquier plazo.

## 12. Fuentes consultadas
- AEAT, régimen de tributación conjunta entre Estado y País Vasco (umbral de 10 millones y regla del 75 %).
- Guía pública sobre formas jurídicas en España (capital mínimo de la SL tras la ley Crea y Crece y de la SA).
- Las páginas de la AEAT sobre el censo (modelos 036 y 037) no cargaron; los datos del alta censal son de conocimiento general y están por verificar.
