import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { SectionContent } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContentFieldProps {
  item: SectionContent;
  value: string;
  onChange: (value: string) => void;
  sectionType: string;
  sectionMode?: string;
  onModeChange?: (mode: string) => void;
  showSeparator?: boolean;
  disabled?: boolean;
}

export function ContentField({
  item,
  value,
  onChange,
  sectionType,
  sectionMode = "both",
  onModeChange,
  showSeparator = true,
  disabled = false,
}: ContentFieldProps) {
  const { t } = useLanguage();

  const renderColorInput = () => {
    try {
      const colorData = JSON.parse(value || '{"mode":"single","value":"#000000"}');

      if (sectionMode === "both") {
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Color Modo Claro
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={colorData.lightValue || colorData.value || "#000000"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.lightValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorData.lightValue || colorData.value || "#000000"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.lightValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Color Modo Oscuro
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={colorData.darkValue || "#ffffff"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.darkValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorData.darkValue || "#ffffff"}
                  onChange={(e) => {
                    colorData.mode = "both";
                    colorData.darkValue = e.target.value;
                    onChange(JSON.stringify(colorData));
                  }}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={colorData.value || value || "#000000"}
              onChange={(e) => {
                colorData.mode = "single";
                colorData.value = e.target.value;
                onChange(JSON.stringify(colorData));
              }}
              className="w-16 h-10 p-1 border rounded cursor-pointer"
            />
            <Input
              type="text"
              value={colorData.value || value || "#000000"}
              onChange={(e) => {
                colorData.mode = "single";
                colorData.value = e.target.value;
                onChange(JSON.stringify(colorData));
              }}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );
      }
    } catch {
      return (
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-10 p-1 border rounded cursor-pointer"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      );
    }
  };

  const renderBackgroundInput = () => {
    const bgData = JSON.parse(value || '{"type":"color","value":"#ffffff","mode":"both"}');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tipo de Fondo
            </Label>
            <select
              className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              value={bgData.type}
              onChange={(e) => {
                bgData.type = e.target.value;
                if (e.target.value === "color") {
                  bgData.value = bgData.color || "#ffffff";
                } else if (e.target.value === "gradient") {
                  bgData.gradient = bgData.gradient || {
                    from: "#ffffff",
                    to: "#000000",
                    direction: "to-r",
                  };
                } else if (e.target.value === "image") {
                  bgData.image = bgData.image || { url: "", opacity: 1 };
                }
                onChange(JSON.stringify(bgData));
              }}
            >
              <option value="color">Color Sólido</option>
              <option value="gradient">Gradiente</option>
              <option value="image">Imagen</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Modo de Colores
            </Label>
            <select
              className="w-full p-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              value={sectionMode}
              onChange={(e) => onModeChange?.(e.target.value)}
            >
              <option value="both">Ambos Modos (Claro y Oscuro)</option>
              <option value="single">Color Único</option>
            </select>
          </div>
        </div>

        {bgData.type === "color" && (
          <div className="space-y-3">
            {sectionMode === "both" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Color Modo Claro
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={bgData.lightValue || bgData.value || "#ffffff"}
                      onChange={(e) => {
                        bgData.lightValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgData.lightValue || bgData.value || "#ffffff"}
                      onChange={(e) => {
                        bgData.lightValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Color Modo Oscuro
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={bgData.darkValue || "#000000"}
                      onChange={(e) => {
                        bgData.darkValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgData.darkValue || "#000000"}
                      onChange={(e) => {
                        bgData.darkValue = e.target.value;
                        onChange(JSON.stringify(bgData));
                      }}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={bgData.value || "#ffffff"}
                  onChange={(e) => {
                    bgData.value = e.target.value;
                    onChange(JSON.stringify(bgData));
                  }}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={bgData.value || "#ffffff"}
                  onChange={(e) => {
                    bgData.value = e.target.value;
                    onChange(JSON.stringify(bgData));
                  }}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}

        {bgData.type === "image" && (
          <div className="space-y-3">
            <ImageUpload
              value={bgData.image?.url || ""}
              onChange={(url) => {
                bgData.image = bgData.image || {};
                bgData.image.url = url;
                onChange(JSON.stringify(bgData));
              }}
              label="Imagen de fondo"
              folder={`images/${sectionType}-backgrounds`}
            />
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Transparencia: {Math.round((bgData.image?.opacity || 1) * 100)}%
              </Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bgData.image?.opacity || 1}
                onChange={(e) => {
                  bgData.image = bgData.image || {};
                  bgData.image.opacity = parseFloat(e.target.value);
                  onChange(JSON.stringify(bgData));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatsEditor = () => {
    try {
      const stats = JSON.parse(value || '[]');
      return (
        <div className="space-y-3">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Valor (ej: 10K+)"
                  value={stat.value || ''}
                  onChange={(e) => {
                    const newStats = [...stats];
                    newStats[index] = { ...stat, value: e.target.value };
                    onChange(JSON.stringify(newStats));
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const newStats = stats.filter((_: any, i: number) => i !== index);
                    onChange(JSON.stringify(newStats));
                  }}
                  className="px-3 text-red-600 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Etiqueta (ej: Clientes Felices)"
                value={stat.label || ''}
                onChange={(e) => {
                  const newStats = [...stats];
                  newStats[index] = { ...stat, label: e.target.value };
                  onChange(JSON.stringify(newStats));
                }}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newStats = [...stats, { value: '', label: '' }];
              onChange(JSON.stringify(newStats));
            }}
            className="w-full p-2 border-2 border-dashed rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            + Agregar Estadística
          </button>
        </div>
      );
    } catch {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="resize-none font-mono text-sm"
          disabled={disabled}
          placeholder='[{"value": "10K+", "label": "Clientes"}]'
        />
      );
    }
  };

  const renderBenefitsEditor = () => {
    try {
      const items = JSON.parse(value || '[]');
      return (
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex gap-2 items-start">
                <select
                  value={item.icon || 'Leaf'}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, icon: e.target.value };
                    onChange(JSON.stringify(newItems));
                  }}
                  className="p-2 border rounded"
                >
                  <option value="Leaf">🌿 Leaf</option>
                  <option value="ShieldCheck">🛡️ ShieldCheck</option>
                  <option value="Heart">❤️ Heart</option>
                  <option value="Award">🏆 Award</option>
                  <option value="Users">👥 Users</option>
                  <option value="Sparkles">✨ Sparkles</option>
                </select>
                <Input
                  placeholder="Título"
                  value={item.title || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, title: e.target.value };
                    onChange(JSON.stringify(newItems));
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== index);
                    onChange(JSON.stringify(newItems));
                  }}
                  className="px-3 text-red-600 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
              <Textarea
                placeholder="Descripción"
                value={item.description || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...item, description: e.target.value };
                  onChange(JSON.stringify(newItems));
                }}
                rows={2}
                className="resize-none"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newItems = [...items, { icon: 'Leaf', title: '', description: '' }];
              onChange(JSON.stringify(newItems));
            }}
            className="w-full p-2 border-2 border-dashed rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            + Agregar Beneficio
          </button>
        </div>
      );
    } catch {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="resize-none font-mono text-sm"
          disabled={disabled}
          placeholder='[{"icon": "Leaf", "title": "...", "description": "..."}]'
        />
      );
    }
  };

  const renderTestimonialsEditor = () => {
    try {
      const items = JSON.parse(value || '[]');
      return (
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre"
                  value={item.name || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, name: e.target.value };
                    onChange(JSON.stringify(newItems));
                  }}
                  className="flex-1"
                />
                <select
                  value={item.rating || 5}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, rating: parseInt(e.target.value) };
                    onChange(JSON.stringify(newItems));
                  }}
                  className="p-2 border rounded"
                >
                  <option value="5">⭐⭐⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                </select>
                <button
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== index);
                    onChange(JSON.stringify(newItems));
                  }}
                  className="px-3 text-red-600 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Rol/Cargo"
                value={item.role || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...item, role: e.target.value };
                  onChange(JSON.stringify(newItems));
                }}
              />
              <Textarea
                placeholder="Testimonio"
                value={item.text || ''}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = { ...item, text: e.target.value };
                  onChange(JSON.stringify(newItems));
                }}
                rows={2}
                className="resize-none"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newItems = [...items, { name: '', role: '', text: '', rating: 5 }];
              onChange(JSON.stringify(newItems));
            }}
            className="w-full p-2 border-2 border-dashed rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            + Agregar Testimonio
          </button>
        </div>
      );
    } catch {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="resize-none font-mono text-sm"
          disabled={disabled}
          placeholder='[{"name": "...", "role": "...", "text": "...", "rating": 5}]'
        />
      );
    }
  };

  const renderInput = () => {
    switch (item.valueType) {
      case "color":
        return renderColorInput();
      case "background":
        return renderBackgroundInput();
      case "text":
      case "string":
        if (item.key.includes("description") || value.length > 100) {
          return (
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={disabled}
            />
          );
        }
        return <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
      case "image_url":
        return (
          <ImageUpload
            value={value}
            onChange={onChange}
            label={""}
            folder={`images/${sectionType}-images`}
            disabled={disabled}
          />
        );
      case "json":
        if (item.key === 'stats') {
          return renderStatsEditor();
        }
        if (item.key === 'items') {
          if (sectionType.includes('benefits') || sectionType.includes('values')) {
            return renderBenefitsEditor();
          }
          if (sectionType.includes('testimonials')) {
            return renderTestimonialsEditor();
          }
        }
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            className="resize-none font-mono text-sm"
            disabled={disabled}
            placeholder='{"key": "value"}'
          />
        );
      default:
        return <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={item.id} className="font-medium">
          {t(`cms.field.${item.key}`) !== `cms.field.${item.key}` ? t(`cms.field.${item.key}`) : item.displayName}
        </Label>
        <Badge
          variant="outline"
          className={
            item.valueType === "color"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : item.valueType === "background"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              : item.valueType === "text" || item.valueType === "string"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : item.valueType === "image_url"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : item.valueType === "json"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }
        >
          {item.valueType === "background" ? "fondo" : item.valueType}
        </Badge>
      </div>
      {item.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      )}
      {renderInput()}
      {showSeparator && <Separator className="mt-4" />}
    </div>
  );
}
