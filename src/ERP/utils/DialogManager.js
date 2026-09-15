/* © 2026 JSM VALOR. All Rights Reserved. */
/**
 * DialogManager
 * Exposes global methods to trigger custom React UI dialogs instead of native browser popups.
 * This avoids the need to inject `useContext` hooks into 50+ components.
 */

let _setDialogState = null;

export const registerDialogContainer = (setter) => {
    _setDialogState = setter;
};

export const Dialog = {
    alert: (message, title = "Notification", isError = null) => {
        if (isError === null) {
            isError = String(message).toLowerCase().includes("error") || String(message).toLowerCase().includes("fail");
        }
        return new Promise((resolve) => {
            if (_setDialogState) {
                _setDialogState({
                    isOpen: true,
                    type: 'alert',
                    isError,
                    title,
                    message,
                    onConfirm: () => {
                        _setDialogState(prev => ({ ...prev, isOpen: false }));
                        resolve(true);
                    }
                });
            } else {
                console.warn("DialogContainer not mounted. Falling back to native alert.");
                window.alert(message);
                resolve(true);
            }
        });
    },

    
    prompt: (message, title = "Input Required", defaultValue = "") => {
        return new Promise((resolve) => {
            if (_setDialogState) {
                _setDialogState({
                    isOpen: true,
                    type: 'prompt',
                    title,
                    message,
                    inputValue: defaultValue,
                    onConfirm: (val) => {
                        _setDialogState(prev => ({ ...prev, isOpen: false }));
                        resolve(val);
                    },
                    onCancel: () => {
                        _setDialogState(prev => ({ ...prev, isOpen: false }));
                        resolve(null);
                    }
                });
            } else {
                console.warn("DialogContainer not mounted. Falling back to native prompt.");
                const res = window.prompt(message, defaultValue);
                resolve(res);
            }
        });
    },

    confirm: (message, title = "Confirmation Required") => {
        return new Promise((resolve) => {
            if (_setDialogState) {
                _setDialogState({
                    isOpen: true,
                    type: 'confirm',
                    title,
                    message,
                    onConfirm: () => {
                        _setDialogState(prev => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        _setDialogState(prev => ({ ...prev, isOpen: false }));
                        resolve(false);
                    }
                });
            } else {
                console.warn("DialogContainer not mounted. Falling back to native confirm.");
                const res = window.confirm(message);
                resolve(res);
            }
        });
    }
};

// Expose globally for imperative access
window.erpDialog = Dialog;
