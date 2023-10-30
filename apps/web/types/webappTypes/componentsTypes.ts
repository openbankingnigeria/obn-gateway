import { ColumnDef } from "@tanstack/react-table";
import { MouseEventHandler, ReactNode } from "react";
import { TableHeaderProps, TableProps } from "./appTypes";

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
  childrenStyle?: string;
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
  type?: 'NOTIFICATIONS' | 'DEFAULT' | '';
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

export interface PanelProps {
  id: number;
  label: string
  amount?: number
  value: string
}

export interface TopPanelProps {
  panel: PanelProps[]
  currentValue: string
  containerStyle?: string
}

export interface TabelElmentProps extends TableProps {
  actionColumn: ColumnDef<any, any>;
  thStyle?: string;
  tdStyle?: string;
}

export interface TwoFactorAuthModalProps {
  close: () => void;
  loading?: boolean;
  next: () => void;
}