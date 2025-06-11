document.addEventListener('DOMContentLoaded', function() {

    // --- Pengaturan Sitemap ---
    const MAX_URLS_LIMIT = 5000;
    const FILENAME = 'sitemap.xml';

    // --- Elemen DOM ---
    const generateBtn = document.getElementById('generate-btn');
    const statusOutput = document.getElementById('status-output');
    const startIndexInput = document.getElementById('start-index');
    const endIndexInput = document.getElementById('end-index');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    /**
     * ▼▼▼ FUNGSI GENERATOR SITEMAP (DIMODIFIKASI TOTAL) ▼▼▼
     * @param {Array<string>} keywordList - Daftar keyword terpilih.
     * @param {string} siteUrl - URL dasar website.
     * @param {Date} startDate - Tanggal mulai untuk publikasi.
     * @param {number} postsPerDay - Jumlah URL yang akan dipublikasikan per hari.
     * @returns {string} String XML yang lengkap.
     */
    function generateSitemapXml(keywordList, siteUrl, startDate, postsPerDay) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        keywordList.forEach((keyword, index) => {
            if (!keyword) return;

            // Kalkulasi hari publikasi untuk URL saat ini
            const dayOffset = Math.floor(index / postsPerDay);
            const postDate = new Date(startDate);
            postDate.setDate(postDate.getDate() + dayOffset);

            // Buat waktu acak
            const randomHour = Math.floor(Math.random() * 24);
            const randomMinute = Math.floor(Math.random() * 60);
            const randomSecond = Math.floor(Math.random() * 60);
            postDate.setUTCHours(randomHour, randomMinute, randomSecond);
            
            // Format tanggal ke standar W3C Datetime (YYYY-MM-DDTHH:mm:ss+00:00)
            const lastmod = postDate.toISOString();

            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const loc = `${siteUrl}/detail.html?q=${encodeURIComponent(keywordForUrl)}`;

            xml += '  <url>\n';
            xml += `    <loc>${loc}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }

    // --- Logika Utama Saat Tombol Diklik ---
    generateBtn.addEventListener('click', async () => {
        let startNum = parseInt(startIndexInput.value, 10);
        let endNum = parseInt(endIndexInput.value, 10);
        const startDateVal = startDateInput.value;
        const endDateVal = endDateInput.value;

        // Validasi input
        if (!startDateVal || !endDateVal) {
            statusOutput.textContent = 'Error: Please select both a Start Date and an End Date.';
            statusOutput.style.color = 'red';
            return;
        }
        if (isNaN(startNum) || isNaN(endNum) || startNum < 1 || endNum < startNum) {
            statusOutput.textContent = 'Error: Invalid keyword number range.';
            statusOutput.style.color = 'red';
            return;
        }

        const startDate = new Date(startDateVal);
        const endDate = new Date(endDateVal);
        if (endDate < startDate) {
            statusOutput.textContent = 'Error: End Date cannot be earlier than Start Date.';
            statusOutput.style.color = 'red';
            return;
        }
        
        // Terapkan batas maksimum 5000 URL
        if ((endNum - startNum + 1) > MAX_URLS_LIMIT) {
             endNum = startNum + MAX_URLS_LIMIT - 1;
             endIndexInput.value = endNum;
             statusOutput.textContent = `Warning: The range was capped at the maximum limit of ${MAX_URLS_LIMIT} URLs.`;
             statusOutput.style.color = 'orange';
        } else {
             statusOutput.textContent = 'Status: Waiting for action...';
             statusOutput.style.color = '#333';
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            statusOutput.textContent = 'Status: Fetching data...';

            const domainResponse = await fetch('domain.txt');
            if (!domainResponse.ok) throw new Error('Could not find domain.txt file.');
            const siteUrl = (await domainResponse.text()).trim().replace(/\/$/, '');
            if (!siteUrl) throw new Error('domain.txt file is empty.');

            const keywordResponse = await fetch('keyword.txt');
            if (!keywordResponse.ok) throw new Error('Could not find keyword.txt file.');
            let allKeywords = await keywordResponse.text();
            allKeywords = allKeywords.split('\n').filter(k => k.trim() !== '');

            if (startNum > allKeywords.length) throw new Error(`Start number (${startNum}) is greater than total keywords (${allKeywords.length}).`);

            // ▼▼▼ PERUBAHAN UTAMA: Konten diambil berurutan (tidak diacak) ▼▼▼
            const keywordSelection = allKeywords.slice(startNum - 1, endNum);

            // Menghitung jumlah hari dalam rentang (inklusif)
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // Menghitung berapa URL yang harus didistribusikan per hari
            const postsPerDay = Math.ceil(keywordSelection.length / diffDays);

            statusOutput.textContent = `Status: Processing ${keywordSelection.length} URLs over ${diffDays} days (${postsPerDay} URLs/day)...`;

            // Hasilkan konten XML dengan logika baru
            const sitemapXml = generateSitemapXml(keywordSelection, siteUrl, startDate, postsPerDay);

            // Buat file dan picu unduhan
            const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = FILENAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            statusOutput.textContent = `Status: Success! ${FILENAME} generated with scheduled dates over ${diffDays} days.`;
            statusOutput.style.color = 'green';

        } catch (error) {
            console.error('Sitemap Generation Error:', error);
            statusOutput.textContent = `Error: ${error.message}`;
            statusOutput.style.color = 'red';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate & Download sitemap.xml';
        }
    });
    
    // Set tanggal default ke hari ini
    const today = new Date().toISOString().slice(0, 10);
    startDateInput.value = today;
    endDateInput.value = today;
});
