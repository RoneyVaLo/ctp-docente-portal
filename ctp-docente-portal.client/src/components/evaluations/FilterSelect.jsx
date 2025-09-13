import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Label } from "../ui/Label";

const FilterSelect = ({ label, value, onChange, options, placeholder }) => {
  return (
    <div className="relative space-y-2 bg-slate-400/30 p-2 rounded-lg z-100">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange} className="absolute z-50">
        <SelectTrigger>
          <SelectValue placeholder={placeholder} options={options} />
        </SelectTrigger>
        <SelectContent className="z-50">
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem
                className="sticky z-20"
                value={option.id.toString()}
                key={`${label}-${option.id}`}
              >
                {option.name}
              </SelectItem>
            ))
          ) : (
            <div className="sticky z-20 flex w-full cursor-not-allowed text-black font-medium text-center items-center rounded-sm py-2 px-8 text-sm outline-none">
              No hay elementos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
