# Spectra Templates

Esta carpeta contiene templates base para generar especificaciones.

## Estructura

```
templates/
├── layer-00-vision.template.md
├── layer-01-glossary.template.md
├── layer-02-stories.template.md
├── layer-03-business-rules.template.md
├── layer-04-invariants.template.md
├── layer-05-contracts.template.md
├── layer-06-policies.template.md
├── layer-07-events.template.md
├── layer-08-agents.template.md
├── layer-09-skills.template.md
├── layer-10-workflows.template.md
├── layer-11-acceptance-criteria.template.md
└── layer-12-trace.template.md
```

## Evidencia y planificacion segura

- `evidence.json` registra resultados de comprobaciones ya ejecutadas.
- `agent-task.json` define objetivo, criterios y limites de lectura.
- `agent-context.json` contiene solo los fragmentos revisados que el
  planificador puede inspeccionar.

Estos tres contratos son opt-in y no se copian automaticamente con
`spectra init`.

## Uso

Cuando ejecutas `spectra init`, estos templates se copian a `.spectra/` en tu proyecto.

Puedes personalizarlos copiando este directorio a tu proyecto y modificando los archivos.
