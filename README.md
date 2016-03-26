# Remind

My dad has pancreatic cancer. I want to remind him that I love him &mdash; often. **Remind** will send him text messages of my choosing at given intervals.

---

### Functional Specification

r1. CLI to turn _remind_ on / off

- `remind --on`
- `remind --off`

r2. CLI to add / remove _reminders_

- `remind --add="{ tag: 'love', id: 'L1', reminder: 'I love you dude' }"`
- `remind --add="{ tag: 'joke', id: 'J1',  reminder: __random__ }"`

- `remind --remove="J1"`
