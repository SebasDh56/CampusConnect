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
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;
  // Keep helper text and validation feedback discoverable from the same field.
  const describedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="form-field">
      <label htmlFor={fieldId}>
        <span>{label}</span>
      </label>
      {props.as === "select" ? (
        <select
          id={fieldId}
          name={props.name}
          value={props.value}
          onChange={props.onChange as (event: ChangeEvent<HTMLSelectElement>) => void}
          disabled={props.disabled}
          required={props.required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
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
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      )}
      {error ? (
        <small className="field-error" id={errorId}>
          {error}
        </small>
      ) : null}
    </div>
  );
}
