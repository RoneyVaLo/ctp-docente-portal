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
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50">
          {options.map((option) => (
            <SelectItem className="sticky z-20" value={option.id.toString()} key={`${label}-${option.id}`}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
