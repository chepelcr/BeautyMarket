import { useState, useEffect } from "react";
import { SectionWrapper } from "./SectionWrapper";
import { ContentField } from "./ContentField";
import { ContentSection } from "./types";

interface BaseSectionEditorProps {
  sectionType: string;
  title: string;
  description?: string;
  content: ContentSection;
  onSave: (content: ContentSection) => void;
  onInputChange: (key: string, value: string) => void;
  isSaving?: boolean;
}

export function BaseSectionEditor({
  sectionType,
  title,
  description,
  content,
  onSave,
  onInputChange,
  isSaving = false,
}: BaseSectionEditorProps) {
  const [localContent, setLocalContent] = useState<ContentSection>(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalContent(content);
    setHasChanges(false);
  }, [content]);

  const getSectionMode = (): string => {
    const backgroundStyle = localContent?.backgroundStyle?.value || "";
    try {
      const bgData = JSON.parse(backgroundStyle);
      return bgData.mode || "both";
    } catch {
      return "both";
    }
  };

  const updateSectionMode = (newMode: string) => {
    const updates: { [key: string]: string } = {};

    if (localContent.backgroundStyle) {
      try {
        const bgData = JSON.parse(localContent.backgroundStyle.value || "{}");
        bgData.mode = newMode;
        updates.backgroundStyle = JSON.stringify(bgData);
      } catch {
        updates.backgroundStyle = JSON.stringify({
          type: "color",
          mode: newMode,
          value: "#ffffff",
        });
      }
    }

    Object.entries(localContent).forEach(([key, item]) => {
      if (item.valueType === "color") {
        try {
          const colorData = JSON.parse(item.value || "{}");
          colorData.mode = newMode;
          if (newMode === "single") {
            colorData.value = colorData.lightValue || colorData.value || "#000000";
          } else if (newMode === "both") {
            colorData.lightValue = colorData.lightValue || colorData.value || "#000000";
            colorData.darkValue = colorData.darkValue || "#ffffff";
          }
          updates[key] = JSON.stringify(colorData);
        } catch {
          const currentColor = item.value || "#000000";
          if (newMode === "single") {
            updates[key] = JSON.stringify({ mode: "single", value: currentColor });
          } else {
            updates[key] = JSON.stringify({
              mode: "both",
              lightValue: currentColor,
              darkValue: currentColor === "#000000" ? "#ffffff" : "#000000",
            });
          }
        }
      }
    });

    Object.entries(updates).forEach(([key, value]) => {
      handleChange(key, value);
    });
  };

  const handleChange = (key: string, value: string) => {
    setLocalContent((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
    setHasChanges(true);
    onInputChange(key, value);
  };

  const handleSave = () => {
    onSave(localContent);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalContent(content);
    setHasChanges(false);
  };

  const sortedItems = Object.values(localContent).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <SectionWrapper
      title={title}
      description={description}
      itemCount={sortedItems.length}
      hasChanges={hasChanges}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
    >
      {sortedItems.map((item, index) => (
        <ContentField
          key={item.id}
          item={item}
          value={localContent[item.key]?.value || ""}
          onChange={(value) => handleChange(item.key, value)}
          sectionType={sectionType}
          sectionMode={getSectionMode()}
          onModeChange={updateSectionMode}
          showSeparator={index < sortedItems.length - 1}
        />
      ))}
    </SectionWrapper>
  );
}
