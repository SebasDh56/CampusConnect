import type { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  error?: string;
};

type TextProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type SelectProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: Array<{ label: string; value: string }>;
  };

type FormFieldProps = TextProps | SelectProps;

export function FormField(props: FormFieldProps) {
  const { label, error } = props;
  const fieldId = props.id ?? props.name;

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      {props.as === "select" ? (
        <select
          id={fieldId}
          name={props.name}
          value={props.value}
          onChange={props.onChange as (event: ChangeEvent<HTMLSelectElement>) => void}
          required={props.required}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          required={props.required}
          placeholder={props.placeholder}
          type={props.type ?? "text"}
        />
      )}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
