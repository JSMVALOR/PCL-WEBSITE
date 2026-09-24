/* © 2026 JSM VALOR. All Rights Reserved. */
let _addToast = null;

export const registerToastContainer = (add) => {
    _addToast = add;
};

export const Toast = {
    show: (message, type = 'success') => {
        if (_addToast) {
            _addToast({ message, type, id: Date.now() + Math.random() });
        } else {
        }
    },
    undoable: (message, onExecute, onUndo, duration = 10000) => {
        if (_addToast) {
            _addToast({ message, type: 'undo', onExecute, onUndo, duration, id: Date.now() + Math.random() });
        } else {
            // Fallback: just execute immediately if toast system isn't mounted
            onExecute();
        }
    }
};

window.erpToast = Toast;
