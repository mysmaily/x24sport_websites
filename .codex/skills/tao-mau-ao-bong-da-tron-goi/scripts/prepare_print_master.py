#!/usr/bin/env python3
"""Deprecated guard: print-master enlargement is forbidden by the native-master contract."""

raise SystemExit(
    "prepare_print_master.py is disabled: do not resize, upscale, restore, or regenerate a print master. "
    "Generate the artwork at the locked native canvas, then use lock_native_print_master.py "
    "to copy it byte-for-byte into print/."
)
