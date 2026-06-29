# Skill: Image → Dashboard

Convert a reference photograph or diagram of a physical infrastructure space into
production-ready Jemon dashboard code.

---

## Trigger

Activate this skill when the user provides one of:

- A photo of a campus from above (bird's-eye / satellite view)
- A server room interior showing rack rows
- A data-centre floor plan
- A network topology diagram

---

## Step 1 — Spatial Analysis

Inspect the image and extract:

1. **Space type** — campus / floor / rack row / rack unit
2. **Layout grid** — rows × columns, approximate spacing
3. **Zones / buildings** — identify discrete enclosures, give each an `id` slug
4. **Notable features** — hot aisles, cooling units, power distribution panels

Produce a structured JSON analysis:

```json
{
  "spaceType": "campus | floor | rack",
  "layout": { "rows": 3, "cols": 4, "unitSize": [2, 2, 1.5] },
  "zones": [
    {
      "id": "dc-a",
      "label": "DC-A",
      "position": [-3, -3],
      "size": [3, 2.5, 2],
      "notes": "Primary compute cluster, south-west corner"
    }
  ]
}
```

---

## Step 2 — Metric Seeding

For each zone, assign plausible **seed metrics** unless the user has provided live data.
Use this heuristic table:

| Role               | CPU   | MEM   | NET   | TEMP  |
| ------------------ | ----- | ----- | ----- | ----- |
| Compute cluster    | 60–85 | 55–75 | 40–70 | 45–65 |
| Storage array      | 20–35 | 70–90 | 60–80 | 38–52 |
| Network core       | 15–25 | 30–50 | 75–95 | 30–42 |
| Edge / DMZ         | 30–50 | 40–60 | 50–70 | 35–48 |
| Management / OOB   | 5–15  | 20–35 | 10–20 | 28–38 |

Randomise within the range so cards look distinct.

---

## Step 3 — Code Generation

Use the template at `.claude/templates/dashboard.tsx.hbs` to emit the full component.
Key substitutions:

| Placeholder          | Value                                           |
| -------------------- | ----------------------------------------------- |
| `{{componentName}}`  | PascalCase slug from image filename or user name|
| `{{buildings}}`      | JSON array from Step 1 + Step 2                 |
| `{{width}}`          | Default `900` unless user specified             |
| `{{height}}`         | Default `620` unless user specified             |

---

## Step 4 — Acceptance Check

Run every item in `.claude/acceptance-checklist.md` before presenting the result.
If any item fails, fix the generated code before proceeding.

---

## Output Contract

The skill MUST produce:

1. `spatial-analysis.json` — Step 1 output for audit trail
2. `<ComponentName>.tsx` — the generated dashboard component
3. A one-paragraph description of what was recognised in the image

Do NOT output:

- Apologies for uncertain recognition
- Questions about the image (apply best-effort; flag ambiguities inline as `// TODO`)
- Placeholder stub implementations
