export const getLocalAvatar = (name) => {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('sneha') && (lowerName.includes('dr') || lowerName.includes('mula'))) return '/assets/people/Dr_Sneha_Mulla.png';
    if (lowerName.includes('bhumika')) return '/assets/people/bhumika.jpg';
    if (lowerName.includes('pranay')) return '/assets/people/n_pranay_goud.jpg';
    if (lowerName.includes('jyothi')) return '/assets/people/karnati_jyothi.jpg';
    if (lowerName.includes('tarun')) return '/assets/people/tarun_tyagi.jpg';
    if (lowerName.includes('supriya')) return '/assets/people/badri_supriya.jpg';
    if (lowerName.includes('venugopal')) return '/assets/people/venugopal_narayanadas.jpg';
    
    return null;
};

export const getAvatarUrl = (userOrName) => {
    if (!userOrName) return `https://ui-avatars.com/api/?name=US&background=random&color=fff&rounded=true&bold=true`;
    
    let name = 'User';
    let url = null;

    if (typeof userOrName === 'string') {
        name = userOrName;
    } else {
        name = userOrName.full_name || userOrName.name || 'User';
        url = userOrName.profile_picture_url || userOrName.avatar_url;
    }
    
    // Ignore the generic flaticon dummy image so it falls back to a nice letter avatar
    if (url && url.includes('flaticon.com')) {
        url = null;
    }

    if (!url) {
        url = getLocalAvatar(name);
    }
    
    // Ensure the URL is valid, else fallback
    if (url && url.match(/^(\/|http|data)/)) {
        return url;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&rounded=true&bold=true`;
};
