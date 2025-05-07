import * as React from "react";
import { cn } from "@/lib/utils";

export interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  swatchSize?: number;
  colorPreview?: boolean;
}

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className, swatchSize = 24, colorPreview = true, value, onChange, ...props }, ref) => {
    const [color, setColor] = React.useState<string>(value as string || "#ffffff");
    const colorInputRef = React.useRef<HTMLInputElement>(null);

    const handleColorClick = () => {
      colorInputRef.current?.click();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setColor(value as string);
      }
    }, [value]);

    return (
      <div className={cn("flex items-center gap-2", className)}>
        {colorPreview && (
          <div
            className="flex-shrink-0 rounded-full border cursor-pointer"
            style={{
              backgroundColor: color,
              width: `${swatchSize}px`,
              height: `${swatchSize}px`,
              borderColor: "rgba(0,0,0,0.1)",
            }}
            onClick={handleColorClick}
          />
        )}
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          value={color}
          onChange={handleColorChange}
          {...props}
        />
        <input
          ref={ref}
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={props.name || color}
          onChange={(e) => {
            if (e.target.value.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              setColor(e.target.value);
              if (onChange) {
                const syntheticEvent = {
                  ...e,
                  target: {
                    ...e.target,
                    value: e.target.value,
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }
            } else {
              // For non-hex values, just update the text field
              e.preventDefault();
            }
          }}
          placeholder="Renk kodu"
        />
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
