# Integration Example: Using TemplateGallery in Organization Creation

This document shows how to integrate the TemplateGallery component into a multi-step organization creation wizard.

## Complete Example

```tsx
import { useState } from "react";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { TemplateGallery } from "@/components/admin/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrganizationFormData {
  name: string;
  slug: string;
  description: string;
  templateId: string | null | undefined;
}

export default function CreateOrganizationWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    slug: "",
    description: "",
    templateId: undefined,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await apiRequest("POST", "/api/organizations", {
        name: data.name,
        slug: data.slug,
        description: data.description,
      });
      return response.json();
    },
    onSuccess: async (organization) => {
      // If a template was selected, clone it
      if (formData.templateId) {
        try {
          await apiRequest(
            "POST",
            `/api/templates/${formData.templateId}/clone`,
            { organizationId: organization.id }
          );
          toast({
            title: "Success",
            description: "Organization created and template cloned successfully!",
          });
        } catch (error) {
          toast({
            title: "Warning",
            description: "Organization created but template cloning failed.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Organization created successfully!",
        });
      }

      // Navigate to the new organization
      navigate(`/organizations/${organization.id}/settings`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organization",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.name || !formData.slug) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    createOrgMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > stepNumber ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Basic Info</span>
            <span>Choose Template</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter your organization's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Organization Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Beauty Store"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="my-beauty-store"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your store will be available at: {formData.slug}.jmarkets.jcampos.dev
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="A brief description of your store"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Template */}
        {step === 2 && (
          <TemplateGallery
            onSelectTemplate={(templateId) => {
              setFormData({ ...formData, templateId });
              setStep(3); // Auto-advance to review step
            }}
          />
        )}

        {/* Step 3: Review and Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review and Confirm</CardTitle>
              <CardDescription>
                Please review your organization details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <dl className="space-y-2">
                  <div className="flex">
                    <dt className="w-32 text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{formData.name}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-muted-foreground">Slug:</dt>
                    <dd className="font-medium">{formData.slug}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-muted-foreground">Description:</dt>
                    <dd className="font-medium">{formData.description || "None"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Template</h3>
                <p className="text-muted-foreground">
                  {formData.templateId === null
                    ? "Playground (start from scratch)"
                    : formData.templateId
                    ? `Template ID: ${formData.templateId}`
                    : "No template selected"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || createOrgMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createOrgMutation.isPending}
            >
              {createOrgMutation.isPending ? (
                <>
                  <span className="mr-2">Creating...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Key Points

### 1. State Management
Keep track of both the current step and form data:
```tsx
const [step, setStep] = useState(1);
const [formData, setFormData] = useState<OrganizationFormData>({
  name: "",
  slug: "",
  description: "",
  templateId: undefined, // undefined = not selected, null = playground, string = template ID
});
```

### 2. Template Selection Handler
The `onSelectTemplate` callback receives:
- `null` when user selects "Playground" (start from scratch)
- `string` (template ID) when user selects a template

```tsx
<TemplateGallery
  onSelectTemplate={(templateId) => {
    setFormData({ ...formData, templateId });
    setStep(3); // Optionally auto-advance to next step
  }}
/>
```

### 3. Organization Creation with Template Cloning
Create the organization first, then clone the template if one was selected:

```tsx
const createOrgMutation = useMutation({
  mutationFn: async (data: OrganizationFormData) => {
    // Step 1: Create organization
    const response = await apiRequest("POST", "/api/organizations", {
      name: data.name,
      slug: data.slug,
      description: data.description,
    });
    return response.json();
  },
  onSuccess: async (organization) => {
    // Step 2: Clone template if selected
    if (formData.templateId) {
      await apiRequest(
        "POST",
        `/api/templates/${formData.templateId}/clone`,
        { organizationId: organization.id }
      );
    }
    // Navigate to new organization
    navigate(`/organizations/${organization.id}/settings`);
  },
});
```

### 4. Three Template States
Handle three different template states in your UI:
```tsx
{formData.templateId === undefined && "No template selected yet"}
{formData.templateId === null && "Playground (start from scratch)"}
{formData.templateId && `Selected template: ${formData.templateId}`}
```

## Validation

### Basic Information Step
```tsx
if (!formData.name || !formData.slug) {
  toast({
    title: "Validation Error",
    description: "Please fill in all required fields",
    variant: "destructive",
  });
  return;
}
```

### Template Selection
Template selection is optional. Both playground (null) and skipping the selection are valid:
```tsx
// User can proceed without selecting a template
// or explicitly choose playground
const canProceed =
  formData.templateId === null || // Playground
  formData.templateId !== undefined; // Template selected
```

## Error Handling

### Organization Creation Fails
```tsx
onError: (error) => {
  toast({
    title: "Error",
    description: "Failed to create organization",
    variant: "destructive",
  });
}
```

### Template Cloning Fails
```tsx
try {
  await cloneTemplate();
} catch (error) {
  toast({
    title: "Warning",
    description: "Organization created but template cloning failed",
    variant: "destructive",
  });
}
```

## Testing Checklist

- [ ] User can create organization without selecting a template
- [ ] User can create organization with playground option
- [ ] User can create organization with a template
- [ ] Template is cloned successfully after organization creation
- [ ] Error handling works for both organization creation and template cloning
- [ ] User is redirected to correct page after success
- [ ] Back button works correctly through all steps
- [ ] Validation prevents proceeding with invalid data
- [ ] Loading states are shown during async operations

## Next Steps

After creating this component:
1. Replace the CreateOrganization page with this wizard
2. Add proper form validation using Zod
3. Add error boundary for graceful error handling
4. Add analytics tracking for template selection
5. Consider adding a "skip for now" option in template selection
