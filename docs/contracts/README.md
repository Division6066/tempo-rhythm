# docs/contracts — one API contract per batch

`docs/contracts/<batch>.md` lists every backend function the batch's component tickets call,
with args and return shapes. The data ticket must create exactly these; component tickets call
only these. For a size-3 batch (no data ticket) it lists functions that already exist.
