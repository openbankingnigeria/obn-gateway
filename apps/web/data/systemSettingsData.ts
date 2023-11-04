import { EmailServiceProps, ExternalServicesProps, GeneralSettingsDataProps, MockServicesProps } from "@/types/dataTypes";

export const SYSTEM_SETTINGS_PATHS = [
  {
    id: 1,
    label: 'General Settings',
    value: '',
    name: 'general_settings'
  },
  {
    id: 2,
    label: 'Email Service',
    value: 'email_service',
    name: 'email_service'
  },
  {
    id: 3,
    label: 'Email Template',
    value: 'email_template',
    name: 'email_template'
  },
  {
    id: 4,
    label: 'External Services',
    value: 'external_services',
    name: 'external_services'
  },
  {
    id: 5,
    label: 'Mock Services',
    value: 'mock_services',
    name: 'mock_services'
  },
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

export const EMAIL_SERVICE_DATA = ({
  email_provider,
  email_key,
  email_sender_id,
  email_base_url,
}: EmailServiceProps) => [
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


export const GENERAL_SETTINGS_DATA = ({
  inactivity_timeout,
  request_timeout,
  auth_token_expiration_duration,
  password_reset_token_expiration_duration,
  two_fa_expiration_duration,
  invitation_token_expiration_duration,
  failed_login_attempts
}: GeneralSettingsDataProps) => [
  {
    id: 1,
    label: 'Inactivity Timeout',
    description: 'The time period after which a user will be automatically logged out due to inactivity.',
    name: 'inactivity_timeout',
    type: 'number',
    rightLabel: 'mins',
    value: inactivity_timeout
  },
  {
    id: 2,
    label: 'Request Timeout',
    description: 'The maximum duration the system will wait for a response when making external requests.',
    name: 'request_timeout',
    type: 'number',
    rightLabel: 'secs',
    value: request_timeout
  },
  {
    id: 3,
    label: 'Auth Token Expiration Duration',
    description: 'The validity period for tokens used in authenticating user sessions.',
    name: 'auth_token_expiration_duration',
    type: 'number',
    rightLabel: 'secs',
    value: auth_token_expiration_duration
  },
  {
    id: 4,
    label: 'Password Reset Token Expiration Duration',
    description: 'The time frame within which a password reset token must be used.',
    name: 'password_reset_token_expiration_duration',
    type: 'number',
    rightLabel: 'secs',
    value: password_reset_token_expiration_duration
  },
  {
    id: 5,
    label: '2FA Expiration Duration',
    description: 'The validity period for temporary codes generated for two-factor authentication.',
    name: 'two_fa_expiration_duration',
    type: 'number',
    rightLabel: 'secs',
    value: two_fa_expiration_duration 
  },
  {
    id: 6,
    label: 'Invitation Token Expiration Duration',
    description: 'The time frame within which an invitation token for new users must be used.',
    name: 'invitation_token_expiration_duration',
    type: 'number',
    rightLabel: 'mins',
    value: invitation_token_expiration_duration
  },
  {
    id: 7,
    label: 'Failed Login Attempts',
    description: 'The number of unsuccessful login attempts allowed before triggering a security response.',
    name: 'failed_login_attempts',
    type: 'number',
    rightLabel: '',
    value: failed_login_attempts
  },
];