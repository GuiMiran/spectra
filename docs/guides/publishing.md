# Como Publicar Spectra

## Preparación

1. Asegúrate de tener cuenta en npm:
```bash
npm login
```

2. Verifica el nombre está disponible:
```bash
npm search @spectra/core
```

## Publicar Primera Versión

```bash
# Build (si tuvieras código TypeScript)
npm run build

# Test
npm test

# Publish
npm publish --access public
```

## Actualizar Versión

```bash
# Version patch (0.1.0 -> 0.1.1)
npm version patch

# Version minor (0.1.1 -> 0.2.0)
npm version minor

# Version major (0.2.0 -> 1.0.0)
npm version major

# Publicar
npm publish
```

## Verificar

```bash
# Ver info del paquete
npm info @spectra/core

# Instalar desde npm
npm install -g @spectra/core

# Probar CLI
spectra --help
```

## Tags

```bash
# Publicar como beta
npm publish --tag beta

# Publicar como next
npm publish --tag next

# Promover a latest
npm dist-tag add @spectra/core@0.1.0 latest
```

## Despublicar (solo primeras 72 horas)

```bash
npm unpublish @spectra/core@0.1.0
```

## Checklist Pre-Publicación

- [ ] package.json tiene version correcta
- [ ] README.md está actualizado
- [ ] LICENSE está incluido
- [ ] bin/spectra.js tiene permisos ejecutables
- [ ] .npmignore excluye archivos innecesarios
- [ ] Probado localmente: `npm link && spectra init`
- [ ] CHANGELOG.md documentado (si existe)
