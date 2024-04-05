import { BusinessInformationDataProps, ClientIdDataProps, EmailServiceProps, ExternalServicesProps, GeneralSettingsDataProps, LiveModeConfigurationProps, MockServicesProps, OnboardingSettingsProps, TestModeConfigurationProps, UserAgreementsProps } from "@/types/dataTypes";

export const SYSTEM_SETTINGS_PATHS = [
  {
    id: 1,
    label: 'General Settings',
    value: '',
    name: 'general_settings',
    type: 'api-provider',
    subType: 'api-provider'
  },
  // {
  //   id: 2,
  //   label: 'Onboarding Settings',
  //   value: 'onboarding_settings',
  //   name: 'onboarding_settings',
  //   type: 'api-provider',
  //   subType: 'api-provider'
  // },
  {
    id: 3,
    label: 'Email Service',
    value: 'email_settings',
    name: 'email_settings',
    type: 'api-provider',
    subType: 'api-provider'
  },
  {
    id: 4,
    label: 'Email Template',
    value: 'email_templates',
    name: 'email_templates',
    type: 'api-provider',
    subType: 'api-provider'
  },
  // {
  //   id: 5,
  //   label: 'External Services',
  //   value: 'external_services',
  //   name: 'external_services',
  //   type: 'api-provider',
  //   subType: 'api-provider'
  // },
  // {
  //   id: 6,
  //   label: 'Mock Services',
  //   value: 'mock_services',
  //   name: 'mock_services',
  //   type: 'api-provider',
  //   subType: 'api-provider'
  // },
  {
    id: 7,
    label: 'Business Information',
    value: '',
    name: 'business_information',
    type: 'api-consumer',
    subType: 'licensed-entity,business'
  },
  {
    id: 8,
    label: 'Test Mode Configuration',
    value: 'test_mode_configuration',
    name: 'test_mode_configuration',
    type: 'api-consumer',
    subType: 'licensed-entity,business'
  },
  {
    id: 9,
    label: 'Test Mode Configuration',
    value: '',
    name: 'test_mode_configuration',
    type: 'api-consumer',
    subType: 'individual'
  },
  {
    id: 10,
    label: 'Live Mode Configuration',
    value: 'live_mode_configuration',
    name: 'live_mode_configuration',
    type: 'api-consumer',
    subType: 'individual,licensed-entity,business'
  },
  {
    id: 11,
    label: 'User Agreements',
    value: 'user_agreements',
    name: 'user_agreements',
    type: 'api-provider',
    subType: 'api-provider'
  },
  {
    id: 12,
    label: 'Onboarding Settings',
    value: 'onboarding_custom_fields',
    name: 'onboarding_custom_fields',
    type: 'api-provider',
    subType: 'api-provider'
  },
  // {
  //   id: 12,
  //   label: 'Client ID',
  //   value: 'client_id',
  //   name: 'client_id',
  //   type: 'api-consumer',
  //   subType: 'licensed-entity,business'
  // },
];

export const EMAIL_PROVIDERS = [
  {
    id: 1,
    label: 'Sendgrid',
    name: 'sendgrid',
    value: 'sendgrid'
  },
  {
    id: 2,
    label: 'Mailgun',
    name: 'mailgun',
    value: 'mailgun'
  },
  {
    id: 3,
    label: 'Amazone SES',
    name: 'amazone_ses',
    value: 'amazone_ses'
  },
  {
    id: 4,
    label: 'SMTP.com',
    name: 'smtp.com',
    value: 'smtp.com'
  },
  {
    id: 5,
    label: 'SparkPost',
    name: 'sparkpost',
    value: 'sparkpost'
  },
  {
    id: 6,
    label: 'Mailchimp',
    name: 'mailchimp',
    value: 'mailchimp'
  },
  {
    id: 7,
    label: 'Postmark',
    name: 'postmark',
    value: 'postmark'
  },
  {
    id: 8,
    label: 'Mandrill',
    name: 'mandrill',
    value: 'mandrill'
  },
  {
    id: 9,
    label: 'Mailjet',
    name: 'mailjet',
    value: 'mailjet'
  },
  {
    id: 10,
    label: 'Elastic Email',
    name: 'elastic_email',
    value: 'elastic_email'
  },
];

export const MOCK_SERVICES_DATA = ({
  mock_url,
  mockUrlDescription,
}: MockServicesProps) => [
  {
    id: 1,
    label: 'Mock URL',
    description: mockUrlDescription,
    name: 'mock_url',
    type: 'text',
    value: mock_url
  }
];

export const TEST_MODE_CONFIGURATION_DATA = ({
  // test_secret_key,
  // name,
  // description,
  test_api_key,
  // webhook_url,
  // callback_url,
  ip_whitelist,
  clientId
  // timeout
}: TestModeConfigurationProps) => [
  // {
  //   id: 1,
  //   label: 'Test Secret Key',
  //   description: 'A confidential key used for authenticating API requests in a test environment. Keep this key secure.',
  //   name: 'test_secret_key',
  //   type: 'text',
  //   value: test_secret_key,
  //   rightLabel: 'copy',
  //   role: 'Super AC'
  // },
  // {
  //   id: 2,
  //   label: 'Name',
  //   description: 'The name assigned to this API configuration, used for identification and reference within the system.',
  //   name: 'name',
  //   type: 'text',
  //   value: name,
  //   role: 'Super AC'
  // },
  // {
  //   id: 3,
  //   label: 'Description',
  //   description: 'A brief summary that outlines the purpose or functionality of this API configuration.',
  //   name: 'description',
  //   type: 'text',
  //   value: description,
  //   role: 'Super AC'
  // },
  {
    id: 4,
    label: 'Test API Key',
    description: 'A secret key used for backend operations in a test environment.',
    name: 'test_api_key',
    type: 'text',
    permit: 'view-api-key',
    value: test_api_key,
    rightLabel: 'copy',
    role: 'Super AC'
  },
  // {
  //   id: 5,
  //   label: 'Webhook URL',
  //   description: 'The URL endpoint where the system will send automated messages or events related to the API.',
  //   name: 'webhook_url',
  //   type: 'text',
  //   value: webhook_url,
  //   role: 'Other AC'
  // },
  // {
  //   id: 6,
  //   label: 'Callback URL',
  //   description: 'The URL to which the API will redirect the user after a successful or failed request.',
  //   name: 'callback_url',
  //   type: 'text',
  //   value: callback_url,
  //   role: 'Other AC'
  // },
  {
    id: 7,
    label: 'IP Whitelist',
    description: 'An IP address list is allowed to access the API requests, and requests from IPs not on this list will be denied. Multiple IP addresses can be inputted, separating them with commas',
    name: 'ip_whitelist',
    type: 'text',
    permit: '',
    value: ip_whitelist,
    rightLabel: '',
    role: 'Other AC'
  },
  // {
  //   id: 8,
  //   label: 'Timeout',
  //   description: 'The maximum duration the system will wait for a response from the API before terminating the request.',
  //   name: 'timeout',
  //   type: 'number',
  //   value: timeout,
  //   rightLabel: 'secs',
  //   role: 'Other AC'
  // },
  {
    id: 9,
    label: 'Client ID',
    description: 'Your unique client ID',
    name: 'clientId',
    type: 'text',
    permit: '',
    value: clientId,
    rightLabel: '',
    role: 'Other AC'
  },
];


export const LIVE_MODE_CONFIGURATION_DATA = ({
  // secret_key,
  // name,
  // description,
  api_key,
  // webhook_url,
  // callback_url,
  ip_whitelist,
  clientId
  // timeout
}: LiveModeConfigurationProps) => [
  // {
  //   id: 1,
  //   label: 'Secret Key',
  //   description: 'A confidential key used for authenticating API requests in a test environment. Keep this key secure.',
  //   name: 'secret_key',
  //   type: 'text',
  //   value: secret_key,
  //   rightLabel: 'copy',
  //   role: 'Super AC'
  // },
  // {
  //   id: 2,
  //   label: 'Name',
  //   description: 'The name assigned to this API configuration, used for identification and reference within the system.',
  //   name: 'name',
  //   type: 'text',
  //   value: name,
  //   role: 'Super AC'
  // },
  // {
  //   id: 3,
  //   label: 'Description',
  //   description: 'A brief summary that outlines the purpose or functionality of this API configuration.',
  //   name: 'description',
  //   type: 'text',
  //   value: description,
  //   role: 'Super AC'
  // },
  {
    id: 4,
    label: 'API Key',
    description: 'A secret key used for backend operations in a test environment.',
    name: 'api_key',
    type: 'text',
    permit: 'view-api-key',
    value: api_key,
    rightLabel: 'copy',
    role: 'Super AC'
  },
  // {
  //   id: 5,
  //   label: 'Webhook URL',
  //   description: 'The URL endpoint where the system will send automated messages or events related to the API.',
  //   name: 'webhook_url',
  //   type: 'text',
  //   value: webhook_url,
  //   role: 'Other AC'
  // },
  // {
  //   id: 6,
  //   label: 'Callback URL',
  //   description: 'The URL to which the API will redirect the user after a successful or failed request.',
  //   name: 'callback_url',
  //   type: 'text',
  //   value: callback_url,
  //   role: 'Other AC'
  // },
  {
    id: 7,
    label: 'IP Whitelist',
    description: 'An IP address list is allowed to access the API requests, and requests from IPs not on this list will be denied. Multiple IP addresses can be inputted, separating them with commas',
    name: 'ip_whitelist',
    type: 'text',
    permit: '',
    value: ip_whitelist,
    rightLabel: '',
    role: 'Other AC'
  },
  // {
  //   id: 8,
  //   label: 'Timeout',
  //   description: 'The maximum duration the system will wait for a response from the API before terminating the request.',
  //   name: 'timeout',
  //   type: 'number',
  //   value: timeout,
  //   rightLabel: 'secs',
  //   role: 'Other AC'
  // },
  {
    id: 9,
    label: 'Client ID',
    description: 'Your unique client ID',
    name: 'clientId',
    type: 'text',
    permit: '',
    value: clientId,
    rightLabel: '',
    role: 'Other AC'
  },
];

export const EXTERNAL_SERVICES_DATA = ({
  url,
  api_key,
  urlDescription,
  apiKeyDescription,
}: ExternalServicesProps) => [
  {
    id: 1,
    label: 'URL',
    description: urlDescription,
    name: 'url',
    type: 'text',
    value: url
  },
  {
    id: 2,
    label: 'API Key',
    description: apiKeyDescription,
    name: 'api_key',
    type: 'text',
    value: api_key
  },
];

export const _EMAIL_SERVICE_DATA = ({
  email_provider,
  email_key,
  email_sender_id,
  email_base_url,
}: any) => [
  {
    id: 1,
    label: 'Email Provider',
    description: 'Specify the third-party service responsible for sending out emails.',
    name: 'email_provider',
    type: 'select',
    value: email_provider
  },
  {
    id: 2,
    label: 'Email Key',
    description: 'The secure authentication token or API key required to access the email service.',
    name: 'email_key',
    type: 'text',
    value: email_key
  },
  {
    id: 3,
    label: 'Email Sender ID',
    description: 'The designated email address that recipients will see as the sender when they receive emails.',
    name: 'email_sender_id',
    type: 'text',
    value: email_sender_id
  },
  {
    id: 4,
    label: 'Email Base URL',
    description: 'The foundational URL used for generating links within the emails.',
    name: 'email_base_url',
    type: 'text',
    value: email_base_url
  },
];

export const USER_AGREEMENTS_DATA = ({
  privacyPolicy,
  termsAndConditions
}: UserAgreementsProps) => [
  {
    id: 1,
    label: 'Privacy Policy',
    description: '',
    name: 'privacyPolicy',
    type: 'text',
    value: privacyPolicy
  },
  {
    id: 2,
    label: 'Terms And Conditions',
    description: '',
    name: 'termsAndConditions',
    type: 'text',
    value: termsAndConditions
  },
];

export const ONBOARDING_SETTINGS_DATA = ({
  business,
  licensedEntity,
  individual,
}: OnboardingSettingsProps) => [
  {
    id: 1,
    label: 'Business',
    description: '',
    name: 'business',
    values: business
  },
  {
    id: 2,
    label: 'Licensed Entity',
    description: '',
    name: 'licensedEntity',
    values: licensedEntity
  },
  {
    id: 3,
    label: 'Individual',
    description: '',
    name: 'individual',
    values: individual
  },
]

export const EMAIL_SERVICE_DATA = ({
  emailBaseUrl,
  emailFrom,
  emailHost,
  emailPassword,
  emailPort,
  emailUser
}: EmailServiceProps) => [
  {
    id: 1,
    label: 'Email Base URL',
    description: '',
    name: 'emailBaseUrl',
    type: 'text',
    value: emailBaseUrl
  },
  {
    id: 2,
    label: 'Email From',
    description: '',
    name: 'emailFrom',
    type: 'text',
    value: emailFrom
  },
  {
    id: 3,
    label: 'Email Host',
    description: '',
    name: 'emailHost',
    type: 'text',
    value: emailHost
  },
  {
    id: 4,
    label: 'Email Password',
    description: '',
    name: 'emailPassword',
    type: 'password',
    value: emailPassword
  },
  {
    id: 5,
    label: 'Email Port',
    description: '',
    name: 'emailPort',
    type: 'text',
    value: emailPort
  },
  {
    id: 6,
    label: 'Email User',
    description: '',
    name: 'emailUser',
    type: 'text',
    value: emailUser
  },
];

export const CLIENT_ID_DATA = ({
  clientId
}: ClientIdDataProps) => [
  {
    id: 1,
    label: 'Client ID',
    description: '',
    name: 'clientId',
    type: 'string',
    fileType: '',
    placeholder: 'Client ID',
    rightLabel: '',
    value: clientId
  },
];


export const BUSINESS_INFORMATION_DATA = ({
  cac,
  tin,
  regulator_license,
  regulator_license_file,
  regulator_license_file_type,
  certificate_of_incorporation,
  certificate_of_incorporation_file,
  certificate_of_incorporation_file_type,
  company_status_report,
  company_status_report_file,
  company_status_report_file_type
}: BusinessInformationDataProps) => [
  {
    id: 1,
    label: 'CAC Registration Number',
    description: '',
    name: 'cac',
    type: 'string',
    fileType: '',
    placeholder: 'RC Number',
    rightLabel: '',
    value: cac
  },
  {
    id: 2,
    label: 'Tax Identification Number (TIN)',
    description: '',
    name: 'tin',
    fileType: '',
    placeholder: 'Tax Identification Number',
    type: 'number',
    rightLabel: '',
    value: tin
  },
  {
    id: 3,
    label: 'Regulatory License',
    description: '',
    name: 'regulator_license',
    type: 'file',
    fileType: regulator_license_file_type,
    file: regulator_license_file,
    rightLabel: '',
    value: regulator_license
  },
  {
    id: 4,
    label: 'Certificate of Incorporation',
    description: '',
    name: 'certificate_of_incorporation',
    type: 'file',
    fileType: certificate_of_incorporation_file_type,
    file: certificate_of_incorporation_file,
    rightLabel: '',
    value: certificate_of_incorporation
  },
  {
    id: 5,
    label: 'Company Status Report',
    description: '',
    name: 'company_status_report',
    type: 'file',
    fileType: company_status_report_file_type,
    file: company_status_report_file,
    rightLabel: '',
    value: company_status_report
  },
];


export const GENERAL_SETTINGS_DATA = ({
  inactivityTimeout,
  requestTimeout,
  authTokenExpirationDuration,
  passwordResetTokenExpirationDuration,
  twoFaExpirationDuration,
  invitationTokenExpirationDuration,
  failedLoginAttempts
}: GeneralSettingsDataProps) => [
  {
    id: 1,
    label: 'Inactivity Timeout',
    description: 'The time period after which a user will be automatically logged out due to inactivity.',
    name: 'inactivityTimeout',
    type: 'number',
    rightLabel: inactivityTimeout?.unit,
    value: inactivityTimeout?.value
  },
  {
    id: 2,
    label: 'Request Timeout',
    description: 'The maximum duration the system will wait for a response when making external requests.',
    name: 'requestTimeout:',
    type: 'number',
    rightLabel: requestTimeout?.unit,
    value: requestTimeout?.value
  },
  {
    id: 3,
    label: 'Auth Token Expiration Duration',
    description: 'The validity period for tokens used in authenticating user sessions.',
    name: 'authTokenExpirationDuration:',
    type: 'number',
    rightLabel: authTokenExpirationDuration?.unit,
    value: authTokenExpirationDuration?.value
  },
  {
    id: 4,
    label: 'Password Reset Token Expiration Duration',
    description: 'The time frame within which a password reset token must be used.',
    name: 'passwordResetTokenExpirationDuration',
    type: 'number',
    rightLabel: passwordResetTokenExpirationDuration?.unit,
    value: passwordResetTokenExpirationDuration?.value
  },
  {
    id: 5,
    label: '2FA Expiration Duration',
    description: 'The validity period for temporary codes generated for two-factor authentication.',
    name: 'twoFaExpirationDuration',
    type: 'number',
    rightLabel: twoFaExpirationDuration?.unit,
    value: twoFaExpirationDuration?.value
  },
  {
    id: 6,
    label: 'Invitation Token Expiration Duration',
    description: 'The time frame within which an invitation token for new users must be used.',
    name: 'invitationTokenExpirationDuration',
    type: 'number',
    rightLabel: invitationTokenExpirationDuration?.unit,
    value: invitationTokenExpirationDuration?.value
  },
  {
    id: 7,
    label: 'Failed Login Attempts',
    description: 'The number of unsuccessful login attempts allowed before triggering a security response.',
    name: 'failedLoginAttempts',
    type: 'number',
    rightLabel: failedLoginAttempts?.unit,
    value: failedLoginAttempts?.value
  },
];