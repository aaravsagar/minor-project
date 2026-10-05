import React from 'react';

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  disabled = false,
  min,
  max,
  step,
  prefix,
  style = {},
  ...props
}) => {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute',
            left: '10px',
            color: '#667085',
            fontWeight: 500,
            fontSize: '14px',
            pointerEvents: 'none'
          }}>
            {prefix}
          </span>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className="form-control"
          style={{
            paddingLeft: prefix ? '28px' : '12px',
            borderColor: error ? '#B42318' : undefined
          }}
          {...props}
        />
      </div>
      {hint && !error && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export const Textarea = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  rows = 3,
  disabled = false,
  style = {},
  ...props
}) => {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        disabled={disabled}
        className="form-control"
        style={{
          borderColor: error ? '#B42318' : undefined
        }}
        {...props}
      />
      {hint && !error && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  hint,
  disabled = false,
  placeholder = 'Select an option',
  style = {},
  ...props
}) => {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-control"
        style={{
          borderColor: error ? '#B42318' : undefined,
          backgroundColor: '#FFFFFF'
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
            {opt.label ?? opt.name}
          </option>
        ))}
      </select>
      {hint && !error && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};
