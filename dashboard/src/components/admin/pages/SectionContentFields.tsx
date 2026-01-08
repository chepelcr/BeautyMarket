import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/image-upload";
import type { SectionContent, ValueType } from "./types";

interface SectionContentFieldsProps {
  content: SectionContent[];
  control: Control<any>;
  organizationId: string;
  userId: string;
}

export function SectionContentFields({
  content,
  control,
}: SectionContentFieldsProps) {
  const renderField = (item: SectionContent) => {
    const fieldName = `content.${item.key}`;

    switch (item.valueType) {
      case "text":
        // Determine if it's a long text field based on key or value length
        const isLongText =
          item.key.includes("description") ||
          item.key.includes("content") ||
          item.value.length > 100;

        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.displayName}</FormLabel>
                <FormControl>
                  {isLongText ? (
                    <Textarea
                      {...field}
                      placeholder={item.description || `Enter ${item.displayName.toLowerCase()}`}
                      rows={4}
                    />
                  ) : (
                    <Input
                      {...field}
                      placeholder={item.description || `Enter ${item.displayName.toLowerCase()}`}
                    />
                  )}
                </FormControl>
                {item.description && (
                  <FormDescription>{item.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "color":
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.displayName}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      {...field}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                {item.description && (
                  <FormDescription>{item.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "image":
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    label={item.displayName}
                    folder="images/pages"
                  />
                </FormControl>
                {item.description && (
                  <FormDescription>{item.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "boolean":
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{item.displayName}</FormLabel>
                  {item.description && (
                    <FormDescription>{item.description}</FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === "true" || field.value === true}
                    onCheckedChange={(checked) => field.onChange(String(checked))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "json":
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.displayName}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={item.description || "Enter JSON data"}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </FormControl>
                {item.description && (
                  <FormDescription>{item.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "background":
        // Background can be either an image URL or a color
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => {
              const isColor = field.value?.startsWith("#");
              const isImage = field.value?.startsWith("http");

              return (
                <FormItem>
                  <FormLabel>{item.displayName}</FormLabel>
                  <div className="space-y-2">
                    {/* Color option */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={isColor ? field.value : "#ffffff"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={isColor ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Color (#000000)"
                        className="flex-1"
                      />
                    </div>
                    {/* Image option */}
                    <FormControl>
                      <ImageUpload
                        value={isImage ? field.value : ""}
                        onChange={field.onChange}
                        label="Or upload background image"
                        folder="images/backgrounds"
                      />
                    </FormControl>
                  </div>
                  {item.description && (
                    <FormDescription>{item.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        );

      default:
        return (
          <FormField
            key={item.id}
            control={control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.displayName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                {item.description && (
                  <FormDescription>{item.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {content
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => renderField(item))}
    </div>
  );
}
