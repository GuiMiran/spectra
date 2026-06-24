# Integrando Spectra con OpenSpec

> Guía paso a paso para usar Spectra y OpenSpec juntos

---

## El Stack Completo

```
┌─────────────────────────────────────┐
│  SPECTRA (Capa de Dominio)         │
│  Define QUÉ ES el sistema          │
│  .spectra/                          │
│    ├── 03-business-rules.md         │
│    ├── 04-invariants.md             │
│    └── ...                          │
└─────────────────────────────────────┘
         ↓ specs alimentan al agente
┌─────────────────────────────────────┐
│  OPENSPEC (Capa de Construcción)   │
│  Define CÓMO EVOLUCIONA el código  │
│  .openspec/                         │
│    ├── proposals/                   │
│    └── tasks/                       │
└─────────────────────────────────────┘
         ↓ agente construye
┌─────────────────────────────────────┐
│  TU CÓDIGO                          │
│  src/                               │
└─────────────────────────────────────┘
```

---

## Paso 1: Inicializar Spectra

```bash
cd mi-proyecto
spectra init
```

Esto crea `.spectra/` con las 13 capas.

---

## Paso 2: Rellenar Dominio

Edita `SPECTRA-PROMPT.md` con tu contexto de negocio:

```markdown
Project name:        MiSaaS
Sector:             FinTech
Country:            España
Regulations:        PSD2, GDPR, Ley Antifraude
Business model:     Freemium SaaS

Known rules:
- Transacciones >€10,000 requieren verificación adicional
- KYC obligatorio para cuentas business
- Retención de datos 7 años por normativa bancaria
...
```

Envía el prompt a un LLM → genera tus specs.

---

## Paso 3: Inicializar OpenSpec

```bash
npm install -g @openspec/cli
openspec init
```

---

## Paso 4: Crear Feature con Contexto Spectra

**En el chat con tu agente:**

```
Tenemos un proyecto con Spectra como fuente de verdad del dominio.

Antes de empezar, lee estas especificaciones:
- .spectra/03-business-rules.md
- .spectra/04-invariants.md  
- .spectra/01-glossary.md

Ahora, usando OpenSpec, necesito implementar:
"Sistema de verificación de transacciones bancarias"

El feature debe respetar:
- BR-007: Transacciones >€10k requieren 2FA
- INV-003: Balance nunca puede ser negativo
- BR-012: Logs de auditoría obligatorios

/opsx:new transaction-verification
```

El agente:
1. Lee las specs Spectra
2. Entiende las restricciones del dominio
3. Crea la propuesta OpenSpec respetando las reglas
4. Genera tasks que cumplen los invariantes

---

## Paso 5: Implementar con Garantías

```bash
/opsx:ff transaction-verification
```

El agente genera:
- `proposals/transaction-verification/proposal.md`
- `specs/transaction-verification.md`
- `design.md`
- `tasks.md`

**Todo respetando** las reglas de Spectra porque las leyó como contexto.

---

## Paso 6: Actualizar Trazabilidad

Después de implementar:

```bash
# Actualizar matriz de Spectra
echo "
## Feature: transaction-verification
- Implementa: BR-007, BR-012
- Respeta: INV-003
- Artefactos: src/verification/
- Tests: tests/verification.test.ts
" >> .spectra/12-trace.md

# Archivar en OpenSpec
/opsx:archive transaction-verification
```

---

## Workflow Diario

### Nueva Feature

1. **Consultar Spectra**: ¿Qué reglas aplican?
2. **OpenSpec**: `/opsx:new feature-name`
3. **Implementar**: `/opsx:apply` con contexto Spectra
4. **Trazar**: Actualizar `12-trace.md`

### Cambio de Regla de Negocio

1. **Actualizar Spectra**: Editar `.spectra/03-business-rules.md`
2. **Propagar con OpenSpec**: 
   ```
   /opsx:new update-rule-BR-007
   # El agente detecta el cambio y propaga correctamente
   ```

### Debugging

1. **Verificar contra Spectra**: ¿Se violó un invariante?
2. **Consultar trazabilidad**: `12-trace.md` muestra qué regla justifica cada artefacto

---

## Ejemplo Real

### Spectra define el dominio

`.spectra/03-business-rules.md`:
```markdown
## BR-007 — Verificación de Transacciones de Alto Valor

**Regla**: Toda transacción superior a €10,000 debe pasar verificación 2FA.

**Fuente normativa**: PSD2 Art. 97 (SCA para pagos electrónicos)

**Excepciones**: 
- Transferencias entre cuentas del mismo titular
- Pagos recurrentes previamente autorizados

**Ejemplos**:
- ✅ Transferencia de €15,000 → solicitar 2FA
- ✅ Pago recurrente de €20,000 → no requiere 2FA
- ❌ Transferencia de €8,000 → no requiere 2FA
```

`.spectra/04-invariants.md`:
```markdown
## INV-003 — Balance No Negativo

**Condición**: `account.balance >= 0` SIEMPRE

**Violación**: Si el balance queda negativo, el sistema está corrupto.

**Enforcement**: Toda operación debe validar PRE-condición antes de ejecutar.
```

### OpenSpec implementa con ese contexto

```
/opsx:new high-value-verification

# El agente genera:
```

`specs/high-value-verification.md`:
```markdown
# High Value Transaction Verification

## Requirements from Spectra
- Must implement BR-007 (PSD2 compliance)
- Must respect INV-003 (balance invariant)

## Implementation Strategy
1. Pre-transaction check: amount > €10,000 && not_exception
2. Trigger 2FA flow
3. Post-verification: deduct maintaining INV-003

## Edge Cases from Spectra
- Same-account transfers: skip 2FA
- Recurring payments: use stored authorization
```

`tasks.md`:
```markdown
- [ ] Add amount threshold check (BR-007)
- [ ] Implement 2FA service integration
- [ ] Add exception logic (same-account, recurring)
- [ ] Pre-check balance invariant (INV-003)
- [ ] Add audit logging (BR-012)
- [ ] Test with amounts: 9k, 10k, 10.1k, 15k
```

---

## Ventajas de la Integración

| Sin Spectra | Con Spectra |
|-------------|-------------|
| Agente adivina reglas | Agente lee reglas exactas |
| Inventa umbrales (¿€5k? ¿€20k?) | Umbral definido: €10,000 (PSD2) |
| Ignora excepciones | Conoce excepciones documentadas |
| Sin trazabilidad a normativa | Cada decisión → fuente legal |
| Tests incompletos | Tests cubren casos de Spectra |

---

## Conflictos y Resolución

### Si OpenSpec propone algo que viola Spectra

**Escenario**: El agente propone permitir balance negativo temporalmente.

**Resolución**:
```
❌ Rechazado. Viola INV-003 de Spectra.

Alternativa:
1. Verificar saldo ANTES de aprobar transacción
2. Si insuficiente, retornar error inmediatamente
3. Nunca permitir balance < 0
```

### Si Spectra es demasiado restrictivo

**Escenario**: BR-007 bloquea un caso de uso legítimo.

**Resolución**:
1. Actualizar Spectra (agregar excepción justificada)
2. Documentar la decisión en `03-business-rules.md`
3. Re-ejecutar OpenSpec con nueva regla

---

## Checklist de Integración

- [ ] Proyecto tiene `.spectra/` inicializado
- [ ] Proyecto tiene `.openspec/` inicializado
- [ ] READMEs referencian ambos frameworks
- [ ] `.instructions.md` le dice al agente que use ambos
- [ ] CI/CD valida specs Spectra antes de build
- [ ] `12-trace.md` se actualiza en cada PR
- [ ] Equipo conoce la separación de capas

---

## Recursos

- [Spectra Framework](https://github.com/GuiMiran/spectra)
- [OpenSpec](https://github.com/openspec-framework/openspec)
- [Comparación completa](../vs-openspec.md)
