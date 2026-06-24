# Verificar Disponibilidad del Nombre en npm

Antes de publicar `@spectra/core`, necesitas verificar si el scope `@spectra` está disponible.

## Opciones de Nombre

### Opción 1: `@spectra/core` ⭐ (Recomendado)
**Pros**:
- ✅ Corto y memorable
- ✅ Profesional
- ✅ Escalable (puedes agregar `@spectra/cli`, `@spectra/mcp-server`, etc.)

**Contras**:
- ⚠️ Requiere que el scope `@spectra` esté disponible
- ⚠️ Si está tomado, necesitas ser miembro de la organización

**Verificar disponibilidad**:
```bash
npm search @spectra/core
npm view @spectra/core
```

Si devuelve error "404 Not Found" → **Disponible** ✅  
Si muestra info de un paquete → **Tomado** ❌

### Opción 2: `spectra-sdd` (Sin scope)
**Pros**:
- ✅ No requiere scope/organización
- ✅ Diferenciador claro (SDD = Spec-Driven Development)
- ✅ Disponible inmediatamente

**Contras**:
- ⚠️ Menos escalable (no puedes hacer `spectra-sdd/cli`, `spectra-sdd/mcp`, etc.)
- ⚠️ Más largo

**Instalación**:
```bash
npm install -g spectra-sdd
```

### Opción 3: `@spectra-framework/core`
**Pros**:
- ✅ Muy descriptivo
- ✅ Scope personal más probable que esté disponible
- ✅ Escalable

**Contras**:
- ⚠️ Más largo de escribir

**Instalación**:
```bash
npm install -g @spectra-framework/core
```

### Opción 4: `@guimiran/spectra`
**Pros**:
- ✅ Tu scope personal, 100% disponible
- ✅ Inmediatamente publicable
- ✅ Escalable (`@guimiran/spectra-cli`, etc.)

**Contras**:
- ⚠️ Menos reconocible como framework independiente
- ⚠️ Si el proyecto crece, mejor tener scope propio

**Instalación**:
```bash
npm install -g @guimiran/spectra
```

---

## Cómo Verificar Disponibilidad

### Verificar scope completo
```bash
# Ver si @spectra existe
npm search @spectra

# Ver si @spectra/core específicamente existe
npm view @spectra/core
```

### Crear organización en npm (si @spectra está libre)

1. **Ir a npmjs.com/org/create**
2. Crear organización "spectra"
3. Publicar bajo `@spectra/core`

**Costo**: 
- Organizaciones públicas: **Gratis** ✅
- Organizaciones privadas: $7/mes

---

## Recomendación

### Paso 1: Verificar

```bash
npm view @spectra/core
```

### Paso 2a: Si está disponible → Usar `@spectra/core`
```bash
# Crear organización en npmjs.com
# Actualizar package.json (ya hecho)
# Publicar
npm publish --access public
```

### Paso 2b: Si está tomado → Usar alternativa

**Mejor alternativa**: `spectra-sdd`

Actualizar [package.json](../package.json):
```json
{
  "name": "spectra-sdd",
  "version": "0.1.0",
  ...
}
```

Instalación quedará:
```bash
npm install -g spectra-sdd
spectra init  # El CLI sigue siendo "spectra"
```

---

## Actualizar package.json según resultado

Si `@spectra/core` NO está disponible, ejecutar:

```bash
# Opción: spectra-sdd
npm pkg set name="spectra-sdd"

# O opción: @guimiran/spectra
npm pkg set name="@guimiran/spectra"
```

Y actualizar todas las referencias en la documentación.

---

## Verificación Final

Antes de publicar:

```bash
# Ver el nombre actual
npm pkg get name

# Verificar que no existe
npm view $(npm pkg get name | tr -d '"')

# Si sale 404 → Listo para publicar
# Si sale info → Cambiar nombre
```

---

## Comandos de Verificación

```bash
# Script completo de verificación
echo "Verificando disponibilidad de nombres..."
echo ""
echo "1. @spectra/core:"
npm view @spectra/core 2>&1 | grep -q "404" && echo "✅ DISPONIBLE" || echo "❌ TOMADO"
echo ""
echo "2. spectra-sdd:"
npm view spectra-sdd 2>&1 | grep -q "404" && echo "✅ DISPONIBLE" || echo "❌ TOMADO"
echo ""
echo "3. @spectra-framework/core:"
npm view @spectra-framework/core 2>&1 | grep -q "404" && echo "✅ DISPONIBLE" || echo "❌ TOMADO"
echo ""
echo "4. @guimiran/spectra:"
npm view @guimiran/spectra 2>&1 | grep -q "404" && echo "✅ DISPONIBLE" || echo "❌ TOMADO"
```

---

## Siguiente Paso

**Ejecuta ahora**:
```bash
npm view @spectra/core
```

- Si devuelve **404**: Perfecto, usa `@spectra/core` ✅
- Si muestra paquete existente: Elige alternativa y actualiza package.json
