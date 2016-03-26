'use strict';

import fs from 'fs';
import path from 'path';
import { argv as args } from 'yargs';
import R from 'ramda';
import twilio from 'twilio';

export default class Remind {

  constructor() {
    this.__twilio = null;
    this.__config = {};
    try {
      this.__reminders = this.__fetchReminders();
    } catch (err) {
      fs.writeFileSync(path.resolve('data/reminders.json'), JSON.stringify({ reminders: [] }));
      this.__reminders = [];
      this.__sent = [];
    }
  }

  __fetchReminders() {
    return JSON.parse(fs.readFileSync(path.resolve('data/reminders.json'), 'utf8')).reminders;
  }

  __deactivate() {
    console.log('deactivating');
  }

  __send() {
    if (this.__reminders.length) {
      // go through each reminder
      // send reminder
      // move reminder to __sent
      console.log(this.__reminders);
    } else if (this.__sent.length) {
      this.__reminders = this.__sent.slice();
      this.__sent = [];
      this.__send();
    }
  }

  __activate(on) {
    this.__twilio = twilio(on.twilioSID, on.twilioToken);
    this.__config = R.omit(['twilioSID', 'twilioToken'], on);
    this.__send();
  }

  __add(add) {
    if (add.reminder) {
      if (R.find(R.propEq('id', add.id), this.__reminders)) {
        return;
      }
      if (add.reminder === '__random__') {
        // TODO: fetch random joke and replace reminder with joke text
      }
      this.__reminders.push(add);
      let __newReminders = JSON.stringify({ reminders: this.__reminders });
      fs.writeFile(path.resolve('data/reminders.json'), __newReminders, (err) => {
        if (err) {
          throw Error('Error adding reminder -- please try again');
        }
      });
    }
  }

  __remove(id) {
    console.log(`removing ${id}`);
  }

  __routeCommands(__on, __off, __add, __remove) {
    if (__off) {
      this.__deactivate();
    }
    if (__on && __on.phone && __on.twilioSID && __on.twilioToken) {
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
    this.__routeCommands(args.on, args.off, args.add, args.remove);
  }

}
