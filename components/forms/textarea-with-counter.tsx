"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";

type TextareaWithCounterProps = {
  name: string;
  defaultValue?: string;
  minLength?: number;
  className?: string;
  placeholder?: string;
};

export function TextareaWithCounter({ name, defaultValue = "", minLength = 0, className, placeholder }: TextareaWithCounterProps) {
  const [value, setValue] = useState(defaultValue);
  const isEnough = value.trim().length >= minLength;

  return (
    <div>
      <Textarea
        name={name}
        defaultValue={defaultValue}
        className={className}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={isEnough ? "text-pine" : "text-black/45"}>
          {isEnough ? "Текста уже достаточно для публикации" : `Нужно ещё примерно ${Math.max(minLength - value.trim().length, 0)} символов`}
        </span>
        <span className={isEnough ? "text-pine" : "text-black/45"}>
          {value.trim().length} / {minLength}
        </span>
      </div>
    </div>
  );
}
