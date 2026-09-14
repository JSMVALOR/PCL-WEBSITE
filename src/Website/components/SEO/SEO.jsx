import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
    title, 
    description, 
    name = "Prudentia College of Law", 
    type = "website",
    url = "https://prudentiacollegeoflaw.com",
    image = "/ASSETS/LOGOS/pcl_campus_logo.webp",
    jsonLd = null 
}) {
    const fullTitle = title === name ? title : `${title} | ${name}`;
    const fullUrl = typeof window !== 'undefined' ? window.location.href : url;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={image} />
            
            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
