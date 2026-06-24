const fs = require('fs');
const path = require('path');

/**
 * Initialize Spectra framework in a project
 * Called by: npm run init or node scripts/init-project.js
 */

function initProject() {
  const cwd = process.cwd();
  const spectraDir = path.join(cwd, '.spectra');
  
  console.log('🌈 Initializing Spectra Framework...\n');
  
  // Check if already initialized
  if (fs.existsSync(spectraDir)) {
    console.error('❌ Error: .spectra/ directory already exists');
    console.log('   Remove it first or initialize in a different directory');
    process.exit(1);
  }
  
  // Create .spectra directory
  fs.mkdirSync(spectraDir);
  console.log('✅ Created .spectra/ directory');
  
  // Layer definitions
  const layers = [
    { file: '00-vision.md', name: 'Vision & Context' },
    { file: '01-glossary.md', name: 'Domain Glossary' },
    { file: '02-stories.md', name: 'User Stories' },
    { file: '03-business-rules.md', name: 'Business Rules' },
    { file: '04-invariants.md', name: 'Invariants' },
    { file: '05-contracts.md', name: 'Operation Contracts' },
    { file: '06-policies.md', name: 'Decision Policies' },
    { file: '07-events.md', name: 'Domain Events' },
    { file: '08-agents.md', name: 'Agents' },
    { file: '09-skills.md', name: 'Skills' },
    { file: '10-workflows.md', name: 'Workflows' },
    { file: '11-acceptance-criteria.md', name: 'Acceptance Criteria' },
    { file: '12-trace.md', name: 'SPECTRA-TRACE' }
  ];
  
  // Create layer files
  layers.forEach(layer => {
    const layerPath = path.join(spectraDir, layer.file);
    const layerNum = layer.file.split('-')[0];
    const content = `# LAYER ${layerNum} — ${layer.name.toUpperCase()}

> **Status**: To be completed
> 
> Fill this layer using SPECTRA-PROMPT.md as guide, or send the prompt to an LLM to generate complete specs.

---

## Instructions

See [SPECTRA-PROMPT.md](../SPECTRA-PROMPT.md) for detailed instructions on what to include in this layer.

For layer templates and examples, visit: https://github.com/GuiMiran/spectra/tree/main/layers

---

## Notes

_Add your domain-specific content here_
`;
    fs.writeFileSync(layerPath, content);
  });
  
  console.log('✅ Created 13 layer files');
  
  // Copy SPECTRA-PROMPT.md if it exists in the package
  const promptSource = path.join(__dirname, '..', 'SPECTRA-PROMPT.md');
  const promptDest = path.join(cwd, 'SPECTRA-PROMPT.md');
  
  if (fs.existsSync(promptSource)) {
    if (!fs.existsSync(promptDest)) {
      fs.copyFileSync(promptSource, promptDest);
      console.log('✅ Created SPECTRA-PROMPT.md');
    } else {
      console.log('⚠️  SPECTRA-PROMPT.md already exists, skipped');
    }
  }
  
  // Create .instructions.md for AI agents
  const instructionsPath = path.join(cwd, '.instructions.md');
  if (!fs.existsSync(instructionsPath)) {
    const instructions = `# Project Instructions

## Spectra Framework

This project uses Spectra for domain specification.

### AI Agent Instructions

When working on this project:

1. **Read specs first**: Always read relevant layers from \`.spectra/\` before making changes
2. **Respect invariants**: Never violate conditions in \`04-invariants.md\`
3. **Apply business rules**: Follow rules documented in \`03-business-rules.md\`
4. **Use domain language**: Refer to \`01-glossary.md\` for canonical terms
5. **Update traceability**: After changes, update \`12-trace.md\` with new artifacts

### Key Principles

- Specs are the source of truth, code is the derivative
- Every business rule must have a regulatory or domain source
- Invariants are non-negotiable boolean conditions
- Every artifact must trace back to a spec

### Resources

- [Spectra Manifesto](https://github.com/GuiMiran/spectra/blob/main/MANIFESTO.md)
- [Full Documentation](https://github.com/GuiMiran/spectra)
`;
    fs.writeFileSync(instructionsPath, instructions);
    console.log('✅ Created .instructions.md for AI agents');
  }
  
  // Success message
  console.log('\n✨ Spectra initialized successfully!\n');
  console.log('📝 Next steps:\n');
  console.log('1. Open SPECTRA-PROMPT.md and fill in your domain context');
  console.log('2. Send the filled prompt to an LLM (Claude, GPT-4, Gemini)');
  console.log('3. Review and refine the generated specifications');
  console.log('4. Use .spectra/ specs as context for your AI agents\n');
  console.log('📚 Documentation: https://github.com/GuiMiran/spectra');
  console.log('💬 Questions? Open an issue on GitHub\n');
}

// Run if called directly
if (require.main === module) {
  initProject();
}

module.exports = { initProject };
