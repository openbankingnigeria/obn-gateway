import { MouseEventHandler, ReactNode } from "react";

export interface DatePickerProps {
  containerStyle?: string;
  fieldStyle?: string;
  showShortcuts?: boolean
}

export interface AppModalProps {
  children: ReactNode
  effect: MouseEventHandler<HTMLDivElement>
  title?: string
  backgroundStyles?: string
  modalStyles?: string
}

export interface NotificationProps {
  id: number;
  title: string;
  created_on: string;
  body: string;
}

export interface NotificationCardProps {
  id?: number;
  title: string;
  created_on: string;
  body: string;
}

export interface NotificationBoxProps {
  notifications: NotificationProps[],
  close: () => void
}

export interface EmptyStateProps {
  type: 'NOTIFICATIONS' | '';
  title: string;
  body: string;
  parentStyle?: string;
  titleStyle?: string;
  bodyStyle?: string;
  iconStyle?: string;
  containerStyle?: string;
}

export interface AvartarMenuProps {
  loadingLogout: boolean
  handleLogout: () => void
}