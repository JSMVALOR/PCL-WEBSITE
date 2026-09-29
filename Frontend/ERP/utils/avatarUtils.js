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
