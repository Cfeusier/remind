'use strict';

import { argv as args } from 'yargs';
import R from 'ramda';
import twilio from 'twilio';

export default class Remind {

  constructor() {
    this.__twilio = null;
    this.__config = {};
  }

  __deactivate() {
    console.log('deactivating');
  }

  __activate(on) {
    this.__twilio = twilio(on.twilioSID, on.twilioToken);
    this.__config = R.omit(['twilioSID', 'twilioToken'], on);
  }

  __add(add) {
    console.log('adding');
  }

  __remove(id) {
    console.log(`removing ${id}`);
  }

  run() {
    // { minterval: y|mon|d|h|min, random: Boolean, phone: PhoneNumber, twilioSID: SID, twilioToken: AuthToken }
    let __on = args.on;
    // boolean
    let __off = args.off;
    // { tag: String, id: String, reminder: String|__random__ }
    let __add = args.add;
    // id
    let __remove = args.remove;

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

}
