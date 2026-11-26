# Plataforma modular: core, horizontales y verticales

> Generado con SPECTRA · github.com/GuiMiran/spectra

![Barrio modular](../../assets/barrio-modular.svg)

## Las tres piezas

**Core.** Fuente de verdad: empresas, terceros, productos, roles y licencias. Los demás lo referencian por identificador, nunca guardan copias.

**Horizontales.** Backoffice que sirve a cualquier sector: facturación, contabilidad, nóminas. Se activan por licencia (candado). Punteado: previsto a futuro.

**Verticales.** Lo propio de cada negocio: citas, TPV, recetas. Se generan desde el catálogo y piden el backoffice por eventos.

## Un servicio en la peluquería de Pepita

1. **Termina el servicio.** El vertical Peluquería emite `ServicioPrestado` al bus.
2. **Facturación lo recoge.** Con licencia activa, crea el ticket o la factura con la familia fiscal correcta.
3. **Se emite la factura.** Facturación publica `FacturaEmitida` en el bus.
4. **Contabilidad contabiliza.** Genera el asiento. Sin su licencia, el evento espera en cola 90 días (DEC-01).

Línea punteada fina entre el core y cada módulo: referencia por identificador. Línea gruesa: el recorrido del ejemplo.

## Reglas de convivencia
1. Una entidad va al core solo si la necesitan **dos o más módulos**.
2. Los módulos referencian las entidades del core por identificador; nunca guardan copias.
3. Los módulos no se comunican entre sí directamente: lo hacen por **eventos**.
4. Un módulo sin licencia no ejecuta operaciones ni recibe eventos, pero **nunca pierde los datos** del cliente.

## Rentabilidad por despacho
Con una capa de medición de uso (sección 6 del contrato del core) se puede saber cuánto cuesta cada despacho, cuál genera más carga y cuál deja más margen. No sale solo: cada módulo declara su uso y alguien registra el tiempo humano de soporte.

## Datos de interés
- [ECC (Agent Harness Operating System)](https://github.com/affaan-m/everything-claude-code): toolkit MIT con agentes, skills, hooks y memoria para agentes de código. No define specs: SPECTRA define el *qué* y herramientas como ECC pueden ser el entorno donde el agente constructor ejecuta el *cómo*. Cifras de uso autodeclaradas, sin verificar; empezar por el perfil mínimo de instalación.

## Documentos
- [Contrato del core: entidades, eventos, licencias, invariantes y decisiones](core-contratos.md)
- [Dominio fiscal del SaaS de facturación](../saas-facturacion/dominio-fiscal.md)
