# Remind

My dad has pancreatic cancer. I want to remind him that I love him &mdash; often. **Remind** will send him text messages of my choosing at given intervals.

---

### Functional Specification

r1. CLI to turn _remind_ on / off

- `remind --on.phone=<PHONE_NUMBER> --on.twilioSID=<TWILIO_SID> --on.twilioToken=<TWILIO_AUTH_TOKEN>`
- `remind --off`

r2. CLI to add / remove _reminders_

- `remind --add.tag=love --add.id=L1 --add.reminder='I love you dude'`
- `remind --add.tag=joke --add.id=J1 --add.reminder='__random'`

- `remind --remove="J1"`
