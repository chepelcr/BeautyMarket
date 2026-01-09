import { useState } from 'react';
import { Printer, XCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Order } from '@/models';

interface OrderActionsProps {
  order: Order;
  onStatusUpdate: (status: string) => void;
}

export function OrderActions({ order, onStatusUpdate }: OrderActionsProps) {
  const { t } = useLanguage();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = () => {
    if (cancelReason.trim()) {
      onStatusUpdate('cancelled');
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  const handleAddNotes = () => {
    // In the future, this would save notes to the backend
    console.log('Adding notes:', notes);
    setShowNotesDialog(false);
    setNotes('');
  };

  const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.actions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            {t('orders.actions.printInvoice')}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowNotesDialog(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('orders.actions.addNotes')}
          </Button>

          {canCancel && (
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('orders.actions.cancelOrder')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('orders.actions.cancelOrder')}</DialogTitle>
            <DialogDescription>
              {t('orders.actions.cancelOrderDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('orders.actions.cancelReason')}
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('orders.actions.cancelReasonPlaceholder')}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
            >
              {t('orders.actions.confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('orders.actions.addNotes')}</DialogTitle>
            <DialogDescription>
              {t('orders.actions.addNotesDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('orders.actions.notes')}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('orders.actions.notesPlaceholder')}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNotesDialog(false);
                setNotes('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddNotes} disabled={!notes.trim()}>
              {t('orders.actions.saveNotes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
