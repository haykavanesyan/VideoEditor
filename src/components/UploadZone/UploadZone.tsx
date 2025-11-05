import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import styles from './UploadZone.module.scss';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

const UploadZone: React.FC<UploadZoneProps> = observer(({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'video/mp4' || file.type === 'video/webm' || file.type === 'video/quicktime')) {
      onFileUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={styles.uploadZone}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload size={64} className={styles.uploadIcon} />
      <h2 className={styles.title}>Upload Your Video</h2>
      <p className={styles.subtitle}>Drag and drop or click to browse</p>
      <p className={styles.fileTypes}>Supports MP4, MOV, WEBM</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleInputChange}
        className={styles.fileInput}
      />
    </div>
  );
});

export default UploadZone;