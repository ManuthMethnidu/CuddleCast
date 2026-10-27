import React from 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    slot?: string;
  }
  interface SVGAttributes<T> {
    slot?: string;
  }
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

declare module 'lucide-react' {
  interface LucideProps {
    slot?: string;
  }
}

type CustomElementProps<T = HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
> & {
  label?: string;
  variant?: string;
  disabled?: boolean;
  type?: string;
  name?: string;
  value?: string | number;
  placeholder?: string;
  selected?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  open?: boolean;
  error?: boolean;
  'error-text'?: string;
  'supporting-text'?: string;
  'has-icon'?: boolean;
  slot?: string;
  min?: number;
  max?: number;
  step?: number;
  icons?: boolean;
  'show-only-selected-icon'?: boolean;
  [key: string]: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': CustomElementProps;
      'md-outlined-button': CustomElementProps;
      'md-elevated-button': CustomElementProps;
      'md-tonal-button': CustomElementProps;
      'md-filled-tonal-button': CustomElementProps;
      'md-text-button': CustomElementProps;
      'md-icon-button': CustomElementProps;
      'md-filled-icon-button': CustomElementProps;
      'md-tonal-icon-button': CustomElementProps;
      'md-filled-tonal-icon-button': CustomElementProps;
      'md-outlined-icon-button': CustomElementProps;
      'md-fab': CustomElementProps;
      'md-branded-fab': CustomElementProps;
      'md-checkbox': CustomElementProps;
      'md-radio': CustomElementProps;
      'md-switch': CustomElementProps;
      'md-slider': CustomElementProps;
      'md-dialog': CustomElementProps;
      'md-elevation': CustomElementProps;
      'md-ripple': CustomElementProps;
      'md-divider': CustomElementProps;
      'md-linear-progress': CustomElementProps;
      'md-circular-progress': CustomElementProps;
      'md-chip-set': CustomElementProps;
      'md-assist-chip': CustomElementProps;
      'md-filter-chip': CustomElementProps;
      'md-input-chip': CustomElementProps;
      'md-suggestion-chip': CustomElementProps;
      'md-tabs': CustomElementProps;
      'md-primary-tab': CustomElementProps;
      'md-secondary-tab': CustomElementProps;
      'md-outlined-text-field': CustomElementProps;
      'md-filled-text-field': CustomElementProps;
      'md-outlined-select': CustomElementProps;
      'md-filled-select': CustomElementProps;
      'md-select-option': CustomElementProps;
      'md-menu': CustomElementProps;
      'md-menu-item': CustomElementProps;
      'md-list': CustomElementProps;
      'md-list-item': CustomElementProps;
      'md-icon': CustomElementProps;
      [elemName: string]: any;
    }
  }
}
