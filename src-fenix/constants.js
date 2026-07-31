/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// Mapping of Fenix semEventName values to field name suffixes.
// Used by campaigns.js, groups.js, and future ads.js for per-event-type row expansion.
// Count field:  cgf_conv_{suffix}     (e.g. cgf_conv_purchase)
// Value field:  cgf_convval_{suffix}  (e.g. cgf_convval_purchase, in haléře)
// ISO 8601 datetime → 'YYYY-MM-DD' (or '' for null/undefined).
function _dateOnly(v) { return v ? String(v).substring(0, 10) : ''; }

var SEM_EVENT_MAP = {
  'Purchase':             'purchase',
  'Lead':                 'lead',
  'AddToCart':            'addtocart',
  'AddToWishlist':        'addtowishlist',
  'ViewContent':          'viewcontent',
  'InitiateCheckout':     'initiatecheckout',
  'AddPaymentInfo':       'addpaymentinfo',
  'CompleteRegistration': 'completeregistration',
  'Subscribe':            'subscribe',
  'Search':               'search',
  'Contact':              'contact'
};
