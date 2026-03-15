
let toastRef = null;

export const registerToast = (ref) => {
    toastRef = ref;
};

export const showToast = (message, type = 'success', description = '') => {
    if (toastRef) {
        toastRef.show(message, type, description);
    } else {
        console.warn('Toast not registered');
    }
};
