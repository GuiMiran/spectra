# Core de la plataforma modular — entidades, eventos y licencias
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador v0.1. Es el "contrato" entre el core, los módulos horizontales (Facturación, Contabilidad, Nóminas…) y los verticales (Peluquería, Colmado…).
> Las decisiones abiertas están marcadas con ❓ y se resumen al final.

---

## 0. Principios
- **P1.** El core es la única fuente de verdad de las entidades compartidas. Un módulo **referencia** por identificador; nunca guarda una copia propia.
- **P2.** Una entidad va al core solo si la necesitan **dos o más módulos**. Si no, es del módulo.
- **P3.** Los módulos no se llaman entre sí: se comunican por **eventos** definidos aquí.
- **P4.** Un módulo sin licencia activa no expone operaciones ni recibe eventos, pero **nunca pierde los datos** del cliente.
- **P5.** Toda operación queda en auditoría con quién, cuándo, sobre qué empresa y qué cambió.

---

## 1. Catálogo de entidades del core

| ID | Entidad | Propietario | Campos clave | Referenciada por |
|---|---|---|---|---|
| CE-01 | **Despacho** | Core | Nombre, NIF, estado, plan | Todos |
| CE-02 | **Empresa** (cliente del despacho o negocio directo) | Core | NIF, razón social, **territorio fiscal** (IVA/IGIC), régimen, periodicidad, actividad (CNAE/IAE), estado | Todos |
| CE-03 | **Usuario** | Core | Identidad, correo, estado, doble factor | Todos |
| CE-04 | **Rol** y **Asignación** (usuario ↔ empresa ↔ rol) | Core | Rol, alcance (despacho o empresa), permisos por módulo | Todos |
| CE-05 | **Tercero** | Core | NIF / NIF-IVA / pasaporte, país, tipo (persona/empresa), dirección fiscal, **rol(es): cliente, proveedor** | Facturación, Contabilidad, Verticales |
| CE-06 | **Producto o servicio base** | Core | Nombre, unidad, precio, **familia fiscal por defecto**, activo | Facturación, Contabilidad, Verticales |
| CE-07 | **Familia fiscal** (dato de referencia) | Core | Impuesto, tipo, calificación, régimen, **vigencia desde/hasta** | Facturación, Contabilidad, Nóminas |
| CE-08 | **Ejercicio y periodo** | Core | Año, trimestres/meses, estado (abierto/cerrado) | Facturación, Contabilidad |
| CE-09 | **Módulo** (catálogo de módulos) | Core | Código, tipo (horizontal/vertical), dependencias | Licencias |
| CE-10 | **Licencia** (suscripción) | Core | Titular (despacho o empresa), módulo, estado, vigencia, límites | Todos |
| CE-11 | **Registro de auditoría** | Core | Usuario, empresa, acción, entidad, antes/después, fecha | Todos |
| CE-12 | **Documento adjunto** | Core | Archivo, huella, origen, empresa | Facturación, Contabilidad |

### Lo que NO va al core (queda en su módulo)
| Entidad | Propietario |
|---|---|
| Factura, línea, serie, rectificativa, registro de facturación, libros | Facturación |
| Asiento, cuenta contable, mayor | Contabilidad |
| Contrato, nómina, cotización | Nóminas |
| Cita, profesional, ficha de animal, receta… | Vertical correspondiente |

**Extensión por vertical:** un vertical puede añadir campos propios a CE-06 (por ejemplo, duración y profesional en una peluquería) sin modificar la entidad del core. ❓

---

## 2. Catálogo de eventos

Regla común: los eventos llevan **identificadores**, no copias de datos; son **inmutables**; se entregan al menos una vez, así que el consumidor debe tolerar duplicados.

### 2.1 Eventos del core
| ID | Evento | Lo dispara | Lo consumen |
|---|---|---|---|
| EV-C01 | EmpresaCreada | Alta de empresa | Módulos activos (inicializan datos) |
| EV-C02 | EmpresaBaja | Baja de empresa | Todos (bloquean operaciones) |
| EV-C03 | TerceroCreado / TerceroModificado / TerceroBaja | Gestión de terceros | Facturación, Contabilidad |
| EV-C04 | ProductoCreado / ProductoModificado | Gestión de productos | Facturación, Verticales |
| EV-C05 | FamiliaFiscalActualizada | Cambio normativo | Facturación, Contabilidad |
| EV-C06 | PeriodoCerrado / PeriodoReabierto | Cierre de periodo | Facturación, Contabilidad |
| EV-C07 | LicenciaActivada | Alta de módulo | El módulo activado |
| EV-C08 | LicenciaSuspendida / LicenciaVencida | Impago o fin de vigencia | El módulo afectado |
| EV-C09 | UsuarioAsignado / UsuarioRevocado | Gestión de acceso | Todos |

### 2.2 Eventos de módulos
| ID | Evento | Emisor | Lo consumen | Efecto |
|---|---|---|---|---|
| EV-V01 | **ServicioPrestado** | Vertical (p. ej. Peluquería) | Facturación | Crea ticket o factura pendiente |
| EV-V02 | **VentaRegistrada** | Vertical con TPV (Colmado, Bar) | Facturación | Crea ticket o factura simplificada |
| EV-F01 | **FacturaEmitida** | Facturación | Contabilidad, Tesorería | Genera asiento, actualiza saldo del tercero |
| EV-F02 | **FacturaRectificada** | Facturación | Contabilidad | Genera asiento de rectificación |
| EV-F03 | **FacturaRecibidaRegistrada** | Facturación | Contabilidad | Genera asiento del gasto |
| EV-F04 | CobroRegistrado / PagoRegistrado | Facturación | Contabilidad | Genera asiento de tesorería |
| EV-F05 | LiquidacionPreparada (303/420) | Facturación | Contabilidad | Genera asiento de liquidación |
| EV-K01 | AsientoGenerado | Contabilidad | Auditoría | Trazabilidad |

### 2.3 Qué pasa si el consumidor no tiene licencia
- El emisor **no se bloquea**: la cita queda completada y la factura queda pendiente de generar.
- El evento se **conserva en cola** durante un plazo configurable ❓ y se procesa si el módulo se activa.
- El cliente ve un aviso: "Hay N operaciones pendientes de facturar. Activa Facturación para procesarlas."

---

## 3. Matriz de licencias

### 3.1 Módulos y dependencias
| Módulo | Tipo | Requiere | Opcional con |
|---|---|---|---|
| Core | Base | — | — |
| Facturación | Horizontal | Core | Contabilidad |
| Contabilidad | Horizontal | Core | Facturación |
| Nóminas | Horizontal | Core | Contabilidad |
| Vertical (Peluquería, Colmado…) | Vertical | Core | Facturación, Contabilidad |

Un vertical **funciona sin** los módulos horizontales (agenda o TPV), pero no factura hasta activar Facturación.

### 3.2 Estados de licencia
| Estado | Qué puede hacer el cliente |
|---|---|
| Prueba | Todo, con límites bajos y marca de prueba |
| Activa | Todo, dentro de los límites del plan |
| Suspendida (impago) | **Solo lectura y exportación**; no se emiten documentos nuevos |
| Vencida | Solo exportación durante un periodo de gracia ❓ |
| Cancelada | Exportación de datos y baja a petición |

### 3.3 Reglas
- **Licencia por empresa o por despacho:** un despacho puede contratar un módulo para todas sus empresas o solo para algunas. ❓
- **Límites por plan:** número de usuarios, empresas y documentos al mes.
- **Facturación con VeriFactu:** una vez emitida una factura, **no se pierde ni se altera** aunque la licencia caduque; se conserva el mínimo legal (4 años).
- **Cambio de plan:** el nuevo plan se aplica al siguiente ciclo salvo ampliación inmediata.

---

## 4. Invariantes del core
- **INV-C01:** toda entidad operativa pertenece a exactamente una empresa.
- **INV-C02:** ningún usuario accede a datos de una empresa sin una asignación activa.
- **INV-C03:** un módulo sin licencia activa no ejecuta operaciones de escritura.
- **INV-C04:** los datos de un cliente nunca se eliminan por vencer una licencia.
- **INV-C05:** un tercero tiene al menos un rol (cliente o proveedor).
- **INV-C06:** una familia fiscal tiene vigencia sin solapes para el mismo impuesto y tipo.
- **INV-C07:** un periodo cerrado no admite documentos nuevos con fecha dentro de él.
- **INV-C08:** cada cambio sobre entidades del core genera un registro de auditoría.
- **INV-C09:** un evento procesado dos veces produce el mismo resultado que procesado una vez.
- **INV-C10:** una empresa tiene un solo territorio fiscal (IVA o IGIC) en un periodo dado.

---

## 5. Decisiones abiertas ❓
1. ¿Cuánto tiempo se conservan los eventos pendientes si el módulo no está activo?
2. ¿Licencia por empresa, por despacho o ambas?
3. ¿Cómo extiende un vertical el producto base sin alterar el core?
4. ¿Cuál es el periodo de gracia tras el vencimiento?
5. ¿Qué límites tiene cada plan (usuarios, empresas, documentos)?
