export interface DeploymentHistory {
  id: string;
  buildId: string;
  status: string;
  message: string;
  startedAt: Date | null;
  completedAt: Date | null;
  deployUrl: string | null;
  errorDetails: string | null;
  filesUploaded: number | null;
  buildSizeKb: number | null;
}

export interface PreDeployment {
  id: string;
  status: string;
  triggerType: string;
  triggerAction: string;
  entityId: string | null;
  entityType: string | null;
  changes: unknown;
  buildId: string | null;
  message: string | null;
  errorDetails: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}
