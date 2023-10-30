import { Dispatch, ReactNode, SetStateAction } from "react";

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
  value?: string
  changeValue?: Dispatch<SetStateAction<string>> | ((value: string) => void)
}

export interface InputElementProps extends FieldsProps {
  type?: string;
  maxLength?: number;
  autoComplete?: string;
  showGuide?: boolean;
}

export interface OptionsProps {
  label: string;
  value: string
}
export interface SelectElementProps extends FieldsProps {
  options: OptionsProps[];
  innerLabel?: string;
  removeSearch?: boolean;
  openUp?: boolean;
  loading?: boolean;
  optionStyle?: string;
  searchPlaceholder?: string;
  disabledValue?: string;
  forFilter?: boolean;
}

export interface ToogleSwitchProps {
  toggle: boolean;
  setToggle: (value: boolean) => void
}