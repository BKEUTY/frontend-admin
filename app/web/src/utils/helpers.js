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

export const PRODUCT_IMAGE_FALLBACK = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23f8fafc%22%2F%3E%3Crect%20x%3D%2228%22%20y%3D%2228%22%20width%3D%2224%22%20height%3D%2234%22%20rx%3D%224%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%2235%22%20y%3D%2220%22%20width%3D%2210%22%20height%3D%228%22%20rx%3D%221%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%2F%3E%3Cline%20x1%3D%2232%22%20y1%3D%2238%22%20x2%3D%2248%22%20y2%3D%2238%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221.5%22%2F%3E%3Cline%20x1%3D%2232%22%20y1%3D%2244%22%20x2%3D%2244%22%20y2%3D%2244%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E';

