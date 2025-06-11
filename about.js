document.addEventListener('DOMContentLoaded', async function() {
    
    async function loadDomainName() {
        try {
            const response = await fetch('domain.txt');
            if (!response.ok) {
                console.warn('domain.txt not found. Using default text.');
                return;
            }
            
            // ▼▼▼ PERUBAHAN DI SINI: Membersihkan URL dari spasi dan / di akhir ▼▼▼
            const siteUrl = (await response.text()).trim().replace(/\/$/, '');

            if (siteUrl) {
                const domainName = new URL(siteUrl).hostname.replace('www.', '');

                const domainSpans = document.querySelectorAll('#domain-name, #domain-name-2');
                
                domainSpans.forEach(span => {
                    if (span.id === 'domain-name') {
                        // Capitalize the first letter for the main mention
                        span.textContent = domainName.charAt(0).toUpperCase() + domainName.slice(1);
                    } else {
                        span.textContent = domainName;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading domain.txt:', error);
        }
    }

    loadDomainName();
});
