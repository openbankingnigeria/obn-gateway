import { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";

export interface FieldsProps {
  placeholder?: string;
  medium?: boolean;
  small?: boolean;
  required?: boolean;
  label?: string;
  name: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  containerStyle?: string;
  labelStyle?: string;
  fieldStyle?: string;
  invalid?: boolean;
  hint?: string;
  value?: string;
  changeValue?: Dispatch<SetStateAction<string>> | ((value: string) => void)
  changeEvent?: ((value: ChangeEvent<HTMLInputElement>) => void)
}

export interface InputElementProps extends FieldsProps {
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  showGuide?: boolean;
}

export interface DragAndUploadElementProps extends FieldsProps {
  changeValue?: any;
  file?: string;
  fileType?: string;
}

export interface TextareaElementProps extends FieldsProps {
  rows: number
}

export interface OptionsProps {
  label: string;
  value: any;
  icon?: ReactNode;
}

export interface SelectElementProps extends FieldsProps {
  options: OptionsProps[];
  innerLabel?: string;
  removeSearch?: boolean;
  clickerStyle?: string;
  value?: any;
  changeValue?: Dispatch<SetStateAction<any>>
  multiple?: boolean;
  loading?: boolean;
  optionStyle?: string;
  searchPlaceholder?: string;
  disabledValue?: string;
  forFilter?: boolean;
  selected?: any[];
  btnTitle?: string;
  emptyState?: string;
  btnPath?: string;
}

export interface ToogleSwitchProps {
  toggle: boolean;
  loading?: boolean;
  setToggle: (value: boolean) => void
}

export interface SearchBarProps {
  placeholder?: string
  searchQuery?: string
  name?: string
  big?: boolean
  containerStyle?: string
}