export const generateSlug = (text, pid, vid) => {
    let str = text ? text.toString().toLowerCase() : '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
      .replace(/ì|í|ị|ỉ|ĩ/g, "i")
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
      .replace(/đ/g, "d")
      .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
      .replace(/\u02C6|\u0306|\u031B/g, "")
      .replace(/[^a-z0-9 ]/g, "") 
      .trim()
      .replace(/\s+/g, "-");

    return str;
};

export const extractIdsFromSlug = (slug) => {
    if (!slug) return { productId: null, variantId: null };
    try {
        const parts = slug.split('-i.');
        if (parts.length < 2) return { productId: slug, variantId: null }; 
        
        const code = parts[parts.length - 1];
        const [encodedPid, encodedVid] = code.split('z');
        
        return {
            productId: parseInt(encodedPid, 36),
            variantId: parseInt(encodedVid, 36)
        };
    } catch (error) {
        return { productId: null, variantId: null };
    }
};
