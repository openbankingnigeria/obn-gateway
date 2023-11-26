export enum COLLECTIONS {
  CUSTOMERS = 'customers',
  ACCOUNTS = 'accounts',
  TRANSACTIONS = 'transactions',
  KYC = 'kyc',
  VIRTUAL_ACCOUNTS = 'virtual-accounts',
  FRAUDS = 'frauds',
  BILLS_PAYMENT = 'bills-payment',
  DIRECT_DEBIT = 'direct-debit',
  CARDS = 'cards',
}

export enum HTTP_METHODS {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export enum KONG_PLUGINS {
  REQUEST_TERMINATION = 'request-termination',
}
