# Guía de Variables — Cómo rellenar el Prompt

> Para cada variable `{{NOMBRE}}`, aquí tienes qué poner, con ejemplos por tipo de negocio.

---

## Variables Obligatorias

| Variable | Qué poner | Ejemplo SaaS Gestión | Ejemplo eCommerce | Ejemplo Clínica |
|----------|-----------|---------------------|-------------------|-----------------|
| `{{NOMBRE_PROYECTO}}` | Nombre de tu producto/proyecto | GestorPyme Pro | MiTienda.es | ClínicaCloud |
| `{{TIPO_PRODUCTO}}` | Formato del producto | SaaS Web | Marketplace B2C | App Web + Móvil |
| `{{SECTOR}}` | Industria principal | Gestión empresarial / Contabilidad | Retail / Moda | Salud / Medicina privada |
| `{{PAIS_JURISDICCION}}` | Dónde opera legalmente | España | España + UE | España (CCAA específica si aplica) |
| `{{NORMATIVA}}` | Leyes y regulaciones que aplican | Ley IVA, RD 1619/2012, Ley Crea y Crece, RGPD, SII | Ley consumidores, IVA, LSSI-CE, RGPD, PSD2 | LOPD-GDD, RGPD, Ley 41/2002 autonomía paciente |
| `{{MODELO_NEGOCIO}}` | Cómo ganas dinero | Suscripción mensual por plan | Comisión por venta + suscripción vendedor | Pago por consulta + suscripción clínica |
| `{{DESCRIPCION_PRODUCTO}}` | Qué hace y para quién (2-5 frases) | *ver abajo* | *ver abajo* | *ver abajo* |
| `{{USUARIOS}}` | Lista de roles/tipos de usuario | Autónomo, Admin pyme, Contable, Empleado | Comprador, Vendedor, Admin, Repartidor | Médico, Paciente, Recepcionista, Admin |
| `{{MODULOS}}` | Áreas funcionales principales | Facturación, Clientes, Gastos, Impuestos, Tesorería | Catálogo, Carrito, Pagos, Envíos, Devoluciones | Citas, Historiales, Recetas, Facturación, Informes |

---

## Variables de Reglas y Restricciones

| Variable | Qué poner | Consejo |
|----------|-----------|---------|
| `{{REGLAS_CONOCIDAS}}` | Reglas de negocio que YA sabes | Incluye TODO lo que sepas: tipos de IVA, plazos, límites, fórmulas. Cuanto más pongas, mejor spec genera |
| `{{RESTRICCIONES_REGULATORIAS}}` | Obligaciones legales específicas | Busca las leyes de tu sector. La IA las conoce pero es mejor ser explícito |
| `{{INTEGRACIONES}}` | Sistemas externos con los que conectar | No es tech — es funcional: "necesito consultar datos fiscales de AEAT" |

---

## Variables de Formato

| Variable | Qué poner | Recomendación |
|----------|-----------|---------------|
| `{{IDIOMA}}` | Idioma de las specs | "Español de España" / "Español México" / "English" |
| `{{COMPLETITUD_NORMATIVA}}` | Hasta dónde llegar con las leyes | Sé específico: "TODA la normativa fiscal española para pymes 2024-2026" |

---

## Variables Opcionales (pero muy útiles)

| Variable | Qué poner | Por qué importa |
|----------|-----------|-----------------|
| `{{COMPETIDORES}}` | Productos similares que existen | La IA entiende el contexto funcional por analogía |
| `{{DIFERENCIACION}}` | Qué te hace diferente | Define el alcance de las specs que NO van en competidores |
| `{{RESTRICCIONES_ALCANCE}}` | Qué NO incluir en esta fase | Evita specs innecesarias en fase 1 |
| `{{INFO_ADICIONAL}}` | Cualquier cosa extra | Documentos, procesos manuales actuales, capturas... |

---

## Ejemplos de `{{DESCRIPCION_PRODUCTO}}` por tipo

### SaaS de Gestión
```
Plataforma SaaS de gestión integral para pymes y autónomos españoles. 
Permite facturación electrónica, gestión de gastos, cálculo automático 
de impuestos (IVA, IRPF, IS), conciliación bancaria, tesorería y 
generación automática de modelos tributarios para presentación ante la AEAT. 
Cumple con la normativa de facturación electrónica Ley Crea y Crece y VeriFactu.
```

### eCommerce
```
Marketplace online que conecta vendedores de moda española con compradores 
en toda la UE. Gestiona catálogo, pagos seguros PSD2/SCA, logística de envíos, 
devoluciones según normativa de consumidores, facturación con IVA por país 
(sistema OSS) y programa de fidelización por puntos.
```

### Clínica
```
Sistema de gestión para clínicas médicas privadas en España. Gestiona citas, 
historiales clínicos electrónicos, prescripción de recetas, facturación al 
paciente y a aseguradoras, consentimientos informados y cumplimiento RGPD/LOPD 
con datos de categoría especial (salud).
```

---

## Proceso recomendado

1. **Copia** `SPEC-DRIVEN-PROMPT.md`
2. **Rellena** las variables usando esta guía
3. **Pega** el prompt completo a la IA
4. **Revisa** la spec generada
5. **Itera**: pide que amplíe, corrija o profundice en capas específicas
6. **Guarda** las specs en la estructura de carpetas como fuente de verdad

---

## Tip: Prompt de seguimiento

Una vez generada la spec, usa este prompt de seguimiento:

```
Revisa la capa {{NUMERO_CAPA}} y:
1. Verifica que TODAS las reglas de {{NORMATIVA}} están cubiertas
2. Añade las excepciones y casos límite que falten
3. Asegura que las referencias cruzadas (IDs) son consistentes
4. Identifica gaps: ¿qué historias/reglas/skills faltan?
```

---
