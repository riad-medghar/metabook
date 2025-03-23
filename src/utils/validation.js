export const validateName = (name) => {
    return name && name.length >= 2 && name.length <= 100;
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
    const re = /^\+?[\d\s-]{10,15}$/;
    return re.test(phone);
};

export const validateFile = (file, type) => {
    if (!file) return false;
    
    if (type === 'book') {
        return file.type === 'application/pdf';
    }
    
    if (type === 'cover') {
        return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    }
    
    return false;
};