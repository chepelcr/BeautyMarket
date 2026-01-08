import { useState } from "react";
import { TemplateGallery } from "@/components/admin/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Demo page showcasing the TemplateGallery component
 *
 * This is a standalone demonstration of how to use the TemplateGallery
 * in the organization creation flow. It shows:
 * - How to integrate the gallery
 * - How to handle template selection
 * - How the playground option works (null templateId)
 *
 * Usage in your actual flow:
 * ```tsx
 * <TemplateGallery
 *   onSelectTemplate={(templateId) => {
 *     if (templateId === null) {
 *       // User selected playground - create empty org
 *       createOrganization({ ...data, templateId: null });
 *     } else {
 *       // User selected a template - clone it
 *       createOrganization({ ...data, templateId });
 *     }
 *   }}
 * />
 * ```
 */
export default function TemplateGalleryDemo() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null | undefined>(undefined);

  const handleSelectTemplate = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
    console.log("Selected template:", templateId === null ? "Playground" : templateId);

    // In your actual implementation, you would:
    // 1. Store the templateId in your form state
    // 2. Proceed to the next step of organization creation
    // 3. When creating the organization, if templateId is not null, call:
    //    POST /api/templates/:templateId/clone with { organizationId }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Demo Header */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Template Gallery Component Demo</CardTitle>
                <CardDescription className="mt-2">
                  This page demonstrates the TemplateGallery component that will be used in the organization creation flow.
                </CardDescription>
              </div>
              <Badge variant="secondary">Demo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <strong>API Endpoint:</strong> GET /api/templates?activeOnly=true (public, no auth required)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <strong>Clone Endpoint:</strong> POST /api/templates/:id/clone (requires auth + organizationId)
                </div>
              </div>
              {selectedTemplateId !== undefined && (
                <div className="flex items-start gap-2 mt-4 p-3 rounded-md bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <strong>Selection Made:</strong>{" "}
                    {selectedTemplateId === null
                      ? "Playground (start from scratch)"
                      : `Template ID: ${selectedTemplateId}`}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Gallery Component */}
        <TemplateGallery onSelectTemplate={handleSelectTemplate} />

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
            <CardDescription>
              How to use this component in your organization creation flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Import the component</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`import { TemplateGallery } from "@/components/admin/templates";`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Step 2: Add to your form/wizard</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`<TemplateGallery
  onSelectTemplate={(templateId) => {
    // templateId is null for playground
    // templateId is a string for actual templates
    setFormData({ ...formData, templateId });
    goToNextStep();
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Step 3: Handle organization creation</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`// After creating the organization
const orgResponse = await createOrganization(formData);
const orgId = orgResponse.id;

// If a template was selected, clone it
if (formData.templateId) {
  await fetch(\`/api/templates/\${formData.templateId}/clone\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId: orgId })
  });
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Search templates by name, description, or category</li>
                <li>Filter templates by category (beauty, tech, fashion, starter)</li>
                <li>Preview templates with full details and live demo links</li>
                <li>Playground option for starting from scratch</li>
                <li>Responsive grid layout with hover effects</li>
                <li>Loading and error states handled</li>
                <li>Empty states for no templates or no search results</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
