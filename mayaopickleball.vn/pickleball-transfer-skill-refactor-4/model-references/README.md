# Pickleball Model References

Store reusable fictional model identity references here.

```text
model-references/
├── female/
│   └── *.png, *.jpg, *.jpeg, *.webp
└── male/
    └── *.png, *.jpg, *.jpeg, *.webp
```

Default generation behavior:

- Pick one random female face from `model-references/female/`.
- Pick one random male face from `model-references/male/` when available.
- If a gender pool is empty, generate a new fictional adult Vietnamese model for that gender.
- Use `scripts/select_model_reference.py --seed <wave-or-product-id>` for reproducible selections.

Reference images must be fictional or approved generated models. Do not add real customer, athlete, celebrity, employee, or scraped social-media faces.
