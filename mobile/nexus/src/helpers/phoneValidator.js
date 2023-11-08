export function phoneValidator(phone) {
    if (!phone) return "Phone Can't Be Empty."
    if ( !/^061\d{7}$/.test(phone) &&
    !/^062\d{7}$/.test(phone) &&
    !/^063\d{7}$/.test(phone) &&
    !/^064\d{7}$/.test(phone) &&
    !/^065\d{7}$/.test(phone) &&
    !/^067\d{7}$/.test(phone) &&
    !/^068\d{7}$/.test(phone) &&
    !/^069\d{7}$/.test(phone) &&
    !/^071\d{7}$/.test(phone) &&
    !/^072\d{7}$/.test(phone) &&
    !/^073\d{7}$/.test(phone) &&
    !/^074\d{7}$/.test(phone) &&
    !/^074\d{7}$/.test(phone) &&
    !/^076\d{7}$/.test(phone) &&
    !/^078\d{7}$/.test(phone) &&
    !/^079\d{7}$/.test(phone) &&
    !/^081\d{7}$/.test(phone) &&
    !/^082\d{7}$/.test(phone) &&
    !/^083\d{7}$/.test(phone) &&
    !/^084\d{7}$/.test(phone)) return 'Ooops! We need a valid phone number.'
    return ''
  }
  