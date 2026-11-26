# Plataforma modular: core, horizontales y verticales

> Generado con SPECTRA · github.com/GuiMiran/spectra

![Barrio modular](../../assets/barrio-modular.svg)

El producto no es un ERP cerrado: es un **catálogo de specs** del que se construye cada pieza. Hay tres tipos de pieza conectadas por un bus de eventos.

| Pieza | Qué es | Ejemplos | Quién es dueño de qué |
|---|---|---|---|
| **Core** | Fuente de verdad compartida | Empresas, terceros, productos, roles, licencias, auditoría | Las entidades que necesitan dos o más módulos |
| **Horizontales** | Backoffice que sirve a cualquier sector, con licencia | Facturación, Contabilidad, Nóminas | Sus propias entidades (factura, asiento, nómina) |
| **Verticales** | Lo propio de cada negocio | Peluquería, Colmado, Farmacia | Citas, TPV, recetas… |

## Reglas de convivencia
1. Una entidad va al core solo si la necesitan **dos o más módulos**.
2. Los módulos referencian las entidades del core por identificador; nunca guardan copias.
3. Los módulos no se llaman entre sí: se comunican por **eventos**.
4. Un módulo sin licencia no ejecuta operaciones ni recibe eventos, pero **nunca pierde los datos** del cliente.

## Ejemplo: un servicio en la peluquería
1. El vertical Peluquería emite `ServicioPrestado`.
2. Facturación, si tiene licencia, crea el ticket o la factura con la familia fiscal correcta.
3. Facturación emite `FacturaEmitida`.
4. Contabilidad genera el asiento. Sin su licencia, el evento espera en cola 90 días (DEC-01).

## Rentabilidad por despacho
Con una capa de medición de uso (sección 6 del contrato del core) se puede saber cuánto cuesta cada despacho, cuál genera más carga y cuál deja más margen. No sale solo: cada módulo declara su uso y alguien registra el tiempo humano de soporte.

## Documentos
- [Contrato del core: entidades, eventos, licencias, invariantes y decisiones](core-contratos.md)
- [Dominio fiscal del SaaS de facturación](../saas-facturacion/dominio-fiscal.md)
