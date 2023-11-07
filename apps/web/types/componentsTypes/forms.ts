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
  autoComplete?: string;
  showGuide?: boolean;
}

export interface TextareaElementProps extends FieldsProps {
  rows: number
}

export interface OptionsProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface SelectElementProps extends FieldsProps {
  options: OptionsProps[];
  innerLabel?: string;
  removeSearch?: boolean;
  openUp?: boolean;
  clickerStyle?: string;
  loading?: boolean;
  optionStyle?: string;
  searchPlaceholder?: string;
  disabledValue?: string;
  forFilter?: boolean;
  selected?: any[];
}

export interface ToogleSwitchProps {
  toggle: boolean;
  setToggle: (value: boolean) => void
}

export interface SearchBarProps {
  placeholder?: string
  searchQuery?: string
  name?: string
  big?: boolean
  containerStyle?: string
}