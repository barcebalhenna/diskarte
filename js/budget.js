/* budget.js — Milestone 2: budget allocation + meter effects.
   Player allocates cash across needs (SRS §4.2.2); under-funding a
   need lowers its meter on week advance. TODO: implement in M2. */
window.Diskarte = window.Diskarte || {};
Diskarte.budget = {
  // SRS §4.2.2 suggested weekly costs (iskolar)
  NEEDS: [
    { key: 'food',   label: 'Food (pagkain)', cost: 700, meter: 'meterFood' },
    { key: 'fare',   label: 'Fare (pamasahe)', cost: 300, meter: 'meterEnergy' },
    { key: 'load',   label: 'Load / data',    cost: 150, meter: 'meterTrust' },
    { key: 'school', label: 'School supplies', cost: 200, meter: 'meterTrust' }
  ]
  // TODO(M2): renderAllocation(), validate (can't exceed cash),
  //           applyToMeters() on End Week, move remainder to savings.
};
