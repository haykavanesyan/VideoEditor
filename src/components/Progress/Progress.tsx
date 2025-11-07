import React from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';

import { videoStore } from '../../stores';

import styles from './Progress.module.scss';

const Progress: React.FC = observer(() => {
    const store = videoStore

    return (
        store.isExporting && (
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${store.exportProgress}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {store.exportProgress}%
                </span>
                <button className={styles.cancelButton} onClick={() => store.cancelExport()}>
                    <X size={16} /> Cancel
                </button>
            </div>
        )
    );
});

export default Progress;