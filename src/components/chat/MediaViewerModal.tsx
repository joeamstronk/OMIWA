import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface MediaViewerModalProps {
  mediaUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  fileName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        {/* Controls */}
        <div className="w-full flex items-center justify-between text-white pb-3">
          <span className="text-sm font-semibold truncate max-w-xs">{fileName || 'Media Preview'}</span>
          <div className="flex items-center space-x-2">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
              title="Open full size"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 max-h-[80vh] flex items-center justify-center bg-black">
          <img
            src={mediaUrl}
            alt={fileName || 'Attachment preview'}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
