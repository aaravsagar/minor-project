import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Textarea, Select } from './FormControls';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Flag } from 'lucide-react';

export const ReportModal = ({
  isOpen,
  onClose,
  targetId,
  targetType = 'requirement', // 'requirement' | 'pitch' | 'seller' | 'buyer'
  targetTitleOrName = 'Item'
}) => {
  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  const [reason, setReason] = useState('Inappropriate Content');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reasonOptions = [
    { value: 'Inappropriate Content', label: 'Inappropriate or offensive content' },
    { value: 'Spam or Misleading', label: 'Spam, fake information or misleading pricing' },
    { value: 'Unresponsive or Fraudulent', label: 'Suspicious user behavior or potential fraud' },
    { value: 'Duplicate Requirement/Pitch', label: 'Duplicate listing or repeated pitch' },
    { value: 'Other', label: 'Other violation of terms' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please provide a brief explanation for this report.');
      return;
    }

    try {
      setLoading(true);
      await reportService.submitReport({
        reporterId: currentUser?.uid || 'anonymous',
        reporterName: userProfile?.name || currentUser?.displayName || 'User',
        targetId,
        targetType,
        targetTitleOrName,
        reason,
        description
      });

      toast.success('Thank you. Your report has been logged for admin review.');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Could not submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetType.toUpperCase()}`}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px', fontSize: '13px', color: '#667085' }}>
          Reporting: <strong style={{ color: '#1F2933' }}>{targetTitleOrName}</strong>
        </div>

        <Select
          label="Reason for reporting"
          options={reasonOptions}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <Textarea
          label="Detailed Explanation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe why this violates platform guidelines..."
          required
          rows={3}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" icon={Flag} loading={loading}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
