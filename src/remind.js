'use strict';

import fs from 'fs';
import path from 'path';
import http from 'http';
import { argv as args } from 'yargs';
import R from 'ramda';
import twilio from 'twilio';
import { CronJob as cron } from 'cron';
const __DURATIONS__ = {
  h: 3600000,
  min: 60000,
  mon: 2592000000,
  y: 31536000000,
  d: 86400000
};
const __TIMEZONE__ = 'America/Los_Angeles';
const __CRON_SCHEDULE__ = '* * * * * *';
const __JOKE_ENDPOINT__ = 'http://api.icndb.com/jokes/random?firstName=Roger&lastName=Feus';

export default class Remind {

  constructor() {
    this.__twilio = null;
    this.__fetch();
  }

  __fetch() {
    try {
      let __data = JSON.parse(fs.readFileSync(path.resolve('data/reminders.json'), 'utf8'));
      this.__reminders = __data.reminders;
      this.__sent = __data.sent;
      this.__lubo = __data.lubo;
      this.__config = __data.config;
    } catch (err) {
      fs.writeFileSync(path.resolve('data/reminders.json'), JSON.stringify({ reminders: [], sent: [], lubo: {}, config: {} }));
      this.__reminders = [];
      this.__sent = [];
      this.__lubo = {};
      this.__config = {};
    }
  }

  __payload() {
    return { reminders: this.__reminders, sent: this.__sent, lubo: this.__lubo, config: this.__config };
  }

  __reminder(body) {
    return { to: `+${this.__config.phone}`, from: `+${this.__config.twilioPhone}`, body: body };
  }

  __write(cb) {
    fs.writeFile(path.resolve('data/reminders.json'), JSON.stringify(this.__payload()), (err) => {
      if (err) {
        throw Error('Error adding reminder -- please try again');
      }
      if (cb) {
        cb();
      }
    });
  }

  __handleFailure(err) {
    if (err) {
      throw Error(`Error sending reminder with id: ${reminder.id}`);
    }
  }

  __triggerSMS(data) {
    this.__twilio.sendMessage(this.__reminder.call(this, data.reminder), this.__handleFailure.bind(this));
  }

  __send() {
    if (this.__reminders.length) {
      let __interval = this.__config.every ? this.__config.every : 'h';
      let __duration = __DURATIONS__[__interval];
      let __now = Date.now();
      if (this.__lubo.ts) {
        let __elapsed = __now - this.__lubo.ts;
        if ( __elapsed >= __duration) {
          let __reminder = this.__reminders.pop();
          this.__sent.push(__reminder);
          this.__lubo.ts = Date.now();
          this.__triggerSMS(__reminder);
        }
      } else {
        let __reminder = this.__reminders.pop();
        this.__sent.push(__reminder);
        this.__lubo.ts = Date.now();
        this.__triggerSMS(__reminder);
      }
    } else {
      this.__reminders = this.__sent.slice();
      this.__sent = [];
      if (!this.__reminders.length) {
        throw Error('Error sending reminders -- must add a reminder first');
      }
    }
  }

  __activate(on) {
    this.__twilio = twilio(on.twilioSID, on.twilioToken);
    this.__config = R.omit(['twilioSID', 'twilioToken'], on);
    let __job = new cron(__CRON_SCHEDULE__, this.__send.bind(this), null, false, __TIMEZONE__);
    this.__write(__job.start.bind(__job));
  }

  __add(add) {
    if (add.reminder) {
      if (R.find(R.propEq('id', add.id), this.__reminders)) {
        return;
      }
      if (add.reminder === '__random__') {
        http.get(__JOKE_ENDPOINT__, (resp) => {
          let __respJSON = '';
          resp.on('data', (chunk) => {
            __respJSON += chunk;
          });
          resp.on('end', () => {
            let __resp = JSON.parse(__respJSON);
            if (__resp.type === 'success') {
              let __joke = {
                id: add.id,
                tag: 'joke',
                reminder: __resp.value.joke
              };
              this.__reminders.push(__joke);
              this.__write();
            }
          });
        });
      } else {
        this.__reminders.push(add);
        this.__write();
      }
    }
  }

  __remove(id) {
    let __idx = R.findIndex(R.propEq('id', id), this.__reminders);
    if (__idx > -1) {
      this.__reminders.splice(__idx, 1);
      this.__write();
      console.log(`Successfully removed reminder with id: ${id}`);
    } else {
      console.log(`No reminder found with id: ${id}`);
    }
  }

  __routeCommands(__on, __add, __remove) {
    if (__on && __on.phone && __on.twilioSID && __on.twilioToken && __on.twilioPhone) {
      this.__activate(__on);
    }
    if (__add) {
      this.__add(__add);
    }
    if (__remove) {
      this.__remove(__remove.id);
    }
  }

  run() {
    this.__routeCommands(args.on, args.add, args.remove);
  }

}
