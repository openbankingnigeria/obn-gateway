import { Dispatch, ReactNode, SetStateAction } from "react";

export interface InputElementProps {
  placeholder?: string;
  medium?: boolean;
  small?: boolean;
  required?: boolean;
  label?: string;
  type?: string;
  maxLength?: number;
  name: string;
  autoComplete?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showGuide?: boolean;
  disabled?: boolean;
  containerStyle?: string;
  labelStyle?: string;
  fieldStyle?: string;
  invalid?: boolean;
  value?: string
  changeValue?: Dispatch<SetStateAction<string>>
  hint?: string;
}