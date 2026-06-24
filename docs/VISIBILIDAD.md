# Como Hacer Spectra Visible para Agentes y Usuarios

## Para Agentes de IA

### 1. Como Contexto en el Proyecto

Los agentes leen las specs automáticamente desde `.spectra/`:

```
tu-proyecto/
├── .spectra/
│   ├── 00-vision.md
│   ├── 01-glossary.md
│   ├── ...
│   └── 12-trace.md
└── src/
```

**Instrucciones para el agente** (en `.instructions.md` o chat):
```markdown
Usa Spectra framework para este proyecto:
- Lee specs desde .spectra/
- Respeta invariantes en 04-invariants.md
- Aplica reglas de negocio de 03-business-rules.md
- Actualiza 12-trace.md al final de cada iteración
```

### 2. Como Skill de VS Code

Crea `SKILL.md` en tu proyecto:

```markdown
---
applyTo:
  - "**/*.md"
  - ".spectra/**"
---

# Spectra Domain Expert

Actúas como experto en Spec-Driven Development usando Spectra.

## Responsabilidades
1. Leer y aplicar especificaciones de .spectra/
2. Validar código contra invariantes
3. Actualizar matriz de trazabilidad

## Reglas
- Nunca violes invariantes de 04-invariants.md
- Cada decisión debe trazarse a una regla de negocio
- Actualiza 12-trace.md después de cada cambio
```

### 3. Como MCP Server

Exponer Spectra via Model Context Protocol:

```json
{
  "mcpServers": {
    "spectra": {
      "command": "npx",
      "args": ["@spectra/mcp-server"],
      "env": {
        "SPECTRA_DIR": ".spectra"
      }
    }
  }
}
```

### 4. En Instrucciones Globales de Copilot

`~/.vscode/copilot-instructions.md`:
```markdown
## Spectra Framework

Para proyectos con directorio `.spectra/`:
- Actúa como agente de dominio, no solo de código
- Lee todas las capas antes de hacer cambios
- Valida contra invariantes booleanas
- Traza cada artefacto a su spec autorizado
```

## Para Usuarios Humanos

### Instalación via npm (recomendado)

```bash
# Instalar globalmente
npm install -g @spectra/core

# Inicializar en tu proyecto
cd mi-proyecto
spectra init
```

### Instalación via Git

```bash
# Clonar el repo
git clone https://github.com/GuiMiran/spectra.git

# Copiar templates a tu proyecto
cp -r spectra/.spectra mi-proyecto/.spectra
cp spectra/SPECTRA-PROMPT.md mi-proyecto/
```

### Como Submodulo

```bash
cd mi-proyecto
git submodule add https://github.com/GuiMiran/spectra.git docs/spectra
ln -s docs/spectra/SPECTRA-PROMPT.md ./SPECTRA-PROMPT.md
```

## Visibilidad en Ecosistema

### Registrar en GitHub Topics

Agregar topics al repo:
- `spec-driven-development`
- `sdd`
- `ai-agents`
- `agentic-ai`
- `business-rules`
- `domain-modeling`

### Publicar en npm Registry

```bash
npm publish --access public
```

Entonces usuarios pueden:
```bash
npm install -g @spectra/core
```

### Documentación Online

Opciones:
1. **GitHub Pages**: https://guimiran.github.io/spectra
2. **GitBook**: Documentación interactiva
3. **Docusaurus**: Site con ejemplos y tutoriales

### Crear Integraciones

- **VS Code Extension**: `vscode-spectra`
- **GitHub Action**: Validar specs en CI/CD
- **Copilot Extension**: Cargar specs automáticamente
- **MCP Server**: Protocolo estándar para LLMs

## Difusión en Comunidad

### Plataformas

1. **GitHub**: 
   - Agregar a awesome-lists
   - Publicar en GitHub Discussions
   
2. **Dev.to / Medium**: 
   - "Introducing Spectra: Specs for AI, not humans"
   
3. **Twitter/X**: 
   - Thread explicando el problema que resuelve
   
4. **Discord/Slack**:
   - Langchain, AI Engineering, SDD communities

### Ejemplos Destacados

Crear showcase con:
- GastroFlow (ya existe)
- Healthcare app con regulaciones HIPAA
- FinTech con cumplimiento bancario
- E-commerce con normativa GDPR

## Diferenciación Clara

### Nombre Completo

**"Spectra Framework"** o **"Spectra SDD"** para diferenciarte de:
- spectra-sdd (CLI técnico de juliosaraiva)
- Otros proyectos con nombre similar

### Tagline Único

> "The specification framework designed to be consumed by AI, not humans"

### URL Corta

Reservar:
- spectra.dev
- spectraframework.com
- spectra-sdd.org

## Métricas de Adopción

Trackear:
- Stars en GitHub
- Downloads en npm
- Issues/PRs de la comunidad
- Menciones en blogs/videos
- Integraciones de terceros
