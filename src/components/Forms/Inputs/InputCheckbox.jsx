import { Checkbox } from "@material-tailwind/react";

export default function InputCheckbox({
  label = "Marque a opção",
  name,
  register,
  errors,
  required = false,
  ...props
}) {
  return (
    <div className="flex items-center">
      <Checkbox
        id={name}
        {...register(name, { required: required && "Este campo é obrigatório." })}
        className={`!border ${errors[name] ? "!border-red-500" : "!border-gray-300"} 
          text-gray-900 focus:ring-2 focus:ring-gray-900`}
        {...props}
      />
      <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {errors[name] && <p className="text-red-500 text-xs mt-1 ml-4">{errors[name].message}</p>}
    </div>
  );
}
