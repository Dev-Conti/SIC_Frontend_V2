import React from 'react';
import { Input, Textarea } from '@material-tailwind/react';

const CustomInput = ({ label, name, register, errors, rules, type = 'text' }) => (
  <div className="w-full">
    <Input
      type={type}
      label={label}
      {...register(name, rules)}
      error={!!errors[name]}
    />
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    )}
  </div>
);

const CustomTextarea = ({ label, name, register, errors, rules }) => (
  <div className="w-full">
    <Textarea
      label={label}
      {...register(name, rules)}
      error={!!errors[name]}
    />
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    )}
  </div>
);

export default { CustomInput, CustomTextarea };
