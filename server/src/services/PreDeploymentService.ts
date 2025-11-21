import { PreDeploymentRepository } from '../repositories';
import { InsertPreDeployment } from '../models';

export class PreDeploymentService {
  constructor(private preDeploymentRepository: PreDeploymentRepository) {}

  async triggerPreDeployment(
    triggerType: 'product' | 'category' | 'cms',
    action: 'create' | 'update' | 'delete',
    entityId?: string,
    entityType?: string,
    changes?: any
  ): Promise<void> {
    try {
      // Check if there's already an active pre-deployment
      const existingPreDeployment = await this.preDeploymentRepository.getActivePreDeployment();

      if (existingPreDeployment) {
        // Update existing pre-deployment with new changes
        const existingChanges = existingPreDeployment.changes as Record<string, any> || {};
        const updatedChanges = {
          ...existingChanges,
          [entityId || 'unknown']: {
            type: triggerType,
            action,
            entityType,
            changes,
            timestamp: new Date().toISOString()
          }
        };

        await this.preDeploymentRepository.updatePreDeployment(existingPreDeployment.id, {
          changes: updatedChanges,
          message: `Múltiples cambios pendientes de publicar`
        });

        console.log('✓ Updated existing pre-deployment with new changes');
        return;
      }

      // Create new pre-deployment
      const preDeploymentData: InsertPreDeployment = {
        status: 'ready',
        triggerType,
        triggerAction: action,
        entityId,
        entityType,
        changes: {
          [entityId || 'unknown']: {
            type: triggerType,
            action,
            entityType,
            changes,
            timestamp: new Date().toISOString()
          }
        },
        message: this.getPreDeploymentMessage(triggerType, action)
      };

      await this.preDeploymentRepository.createPreDeployment(preDeploymentData);
      console.log('✓ Created new pre-deployment');

    } catch (error) {
      console.error('Error triggering pre-deployment:', error);
    }
  }

  private getPreDeploymentMessage(triggerType: string, action: string): string {
    const typeMessages = {
      product: 'producto',
      category: 'categoría',
      cms: 'contenido'
    };

    const actionMessages = {
      create: 'creado',
      update: 'actualizado',
      delete: 'eliminado'
    };

    const type = typeMessages[triggerType as keyof typeof typeMessages] || triggerType;
    const actionMsg = actionMessages[action as keyof typeof actionMessages] || action;

    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${actionMsg} - listo para publicar`;
  }
}
