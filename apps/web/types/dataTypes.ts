export interface ConsumerStatusDataProps {
  all?: number; 
  pending?: number; 
  active?: number; 
  inactive?: number; 
  rejected?: number;
};

export interface ConsentsStatusDataProps {
  all?: number; 
  approved?: number; 
  pending?: number;  
  revoked?: number;
  declined?: number;
}

export interface GeneralSettingsDataProps {
  inactivity_timeout: string;
  request_timeout: string;
  auth_token_expiration_duration: string;
  password_reset_token_expiration_duration: string;
  two_fa_expiration_duration: string;
  invitation_token_expiration_duration: string;
  failed_login_attempts: string;
}

export interface EmailServiceProps {
  email_provider: string;
  email_key: string;
  email_sender_id: string;
  email_base_url: string;
}

export interface ExternalServicesProps {
  url: string;
  api_key: string;
  urlDescription?: string;
  apiKeyDescription?: string;
}

export interface MockServicesProps {
  mock_url: string;
  mockUrlDescription?: string;
}

export interface MembersStatusProps {
  active?: number;
  invited?: number;
}