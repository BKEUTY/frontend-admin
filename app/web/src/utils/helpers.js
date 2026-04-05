export const generateSlug = (name, id) => {
    if (!name) return "";
    let str = name.toLowerCase();
    
    str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
    str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
    str = str.replace(/[ìíịỉĩ]/g, "i");
    str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
    str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
    str = str.replace(/[ỳýỵỷỹ]/g, "y");
    str = str.replace(/đ/g, "d");
    
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/-+/g, "-");
    str = str.replace(/^-+/g, "");
    str = str.replace(/-+$/g, "");
    
    if (id) {
        return `${str}-${id}`;
    }
    return str;
};

export const getIdFromSlug = (slug) => {
    if (!slug) return null;
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    
    const parsedId = Number(id);
    return isNaN(parsedId) ? null : parsedId;
};
