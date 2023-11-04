import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, MouseEventHandler, ReactNode } from "react";
import { TableHeaderProps, TableProps } from "./appTypes";

export interface DatePickerProps {
  containerStyle?: string;
  fieldStyle?: string;
  showShortcuts?: boolean;
  asSingle?: boolean;
  dateFilter?: string;
  name?: string;
  innerLabel?: string;
  popoverDirection?: '' | 'up' | 'down';
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

export interface PanelContainerProps {
  panel: PanelProps[]
  currentValue: string
  containerStyle?: string
  removeSearchParam?: string
}

export interface TopPanelContainerProps extends PanelContainerProps{
  name: string;
}

export interface TabelElmentProps extends TableProps {
  actionColumn?: ColumnDef<any, any>;
  thStyle?: string;
  tdStyle?: string;
}

export interface TwoFactorAuthModalProps {
  close: () => void;
  loading?: boolean;
  next: () => void;
}

export interface MultipleSelectOptionsProps {
  options: any[]
  selected: any[]
  searchQuery?: string
  changeSelected: (value: any[]) => void
  containerStyle?: string
}

export interface ActionsSelectorProps {
  containerStyle?: string;
  medium?: boolean;
  small?: boolean;
  fieldStyle?: string;
  optionStyle?: string;
  leftIcon?: ReactNode;
  label: string;
  rightIcon?: ReactNode;
  options: ReactNode;
}

export interface TablePagination {
  rows: number;
  page: number;
  totalElements?: number
  totalElementsInPage?: number;
  totalPages: number
}

export interface ExportButtonProps {
  name?: string;
  module: string;
}

export interface CodeSnippetProps {
  rawCode: string;
  codeElement?: string | TrustedHTML
  containerStyle?: string;
  noCopy?: boolean;
  codeContainerStyle?: string;
}

export interface RequestMethodTextProps {
  method: any;
}