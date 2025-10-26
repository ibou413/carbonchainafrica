import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';

const steps = [
  'Uploading project image to IPFS',
  'Uploading project document to IPFS',
  'Uploading project metadata to IPFS',
  'Approve transaction in wallet',
  'Submitting project on Hedera',
  'Finalization',
];

interface SubmissionProgressProps {
  currentStep: number;
  errorStep: number | null;
  onClose: () => void;
}

export function SubmissionProgress({ currentStep, errorStep, onClose }: SubmissionProgressProps) {
  const isFinished = currentStep >= steps.length - 1 || errorStep !== null;

  return (
    <div className="space-y-6 p-4">
      <DialogTitle className="text-2xl font-bold text-center mb-6">Submission Progress</DialogTitle>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          const isError = errorStep === index;

          return (
            <div key={index}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {isError ? (
                    <XCircle className="w-8 h-8 text-red-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className={`text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-800'}`}>
                  {step}
                </div>
              </div>
              {index < steps.length - 1 && <Separator className="my-4" />}
            </div>
          );
        })}
      </div>
      {isFinished && (
        <Button onClick={onClose} className="w-full mt-6 py-3 text-lg">Close</Button>
      )}
    </div>
  );
}
