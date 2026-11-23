// src/components/ResetModal.tsx
import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { resetDemoData } from '../services/dataService';
import { useToast } from './ToastProvider';

interface ResetModalProps {
  open: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ open, onClose, onResetComplete }) => {
  const [resetting, setResetting] = useState(false);
  const toast = useToast();

  const handleConfirmReset = () => {
    setResetting(true);
    try {
      resetDemoData();
      toast.add({
        kind: 'success',
        title: 'Demo Data Reset',
        message: 'All customer organizations, team members, and metrics have been restored to initial seed state.',
      });
      onResetComplete?.();
      onClose();
    } catch (error) {
      toast.add({
        kind: 'error',
        title: 'Reset Failed',
        message: error instanceof Error ? error.message : 'Unknown error during reset.',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reset Demo Environment?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action will reset local storage to the original Veylo demo seed dataset.
            </p>
          </div>
        </div>

        <div className="my-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Reinitializes 38 customer organizations and 10 team members.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Restores standard Free, Pro, Business, and Enterprise subscription plans.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Maintains your active demo administrator session.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={resetting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Confirm Reset Data'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetModal;
