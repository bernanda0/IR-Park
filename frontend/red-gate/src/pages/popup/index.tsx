import { XCircleIcon } from '@heroicons/react/20/solid';
import React from 'react';

interface PopupProps {
  message: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup mt-4 mb-4">
      <p className="text-1">{message}</p>
      <div className="flex items-center justify-center">
        <XCircleIcon className="h-10 w-10 mt-2 text-red-600 hover:cursor-pointer" onClick={onClose} />
      </div>
    </div>
  );
};

export default Popup;
