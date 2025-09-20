document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('downloadForm');
    const downloadOptions = document.getElementById('downloadOptions');
    const audioOption = document.getElementById('audioOption');
    const videoOptionLow = document.getElementById('videoOptionLow');
    const videoOptionHigh = document.getElementById('videoOptionHigh');

    // Hide download options initially
    downloadOptions.style.display = 'none';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urlInput = document.getElementById('youtubeUrl');
        const youtubeURL = urlInput.value;

        if (!isValidYouTubeUrl(youtubeURL)) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        // Show download options with animation
        downloadOptions.style.display = 'grid';
        setTimeout(() => {
            downloadOptions.classList.add('visible');
        }, 100);

        // Reset options state
        resetOptionsState();
    });

    // Add click handlers for download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const type = e.target.dataset.type;
            const quality = e.target.dataset.quality;
            const url = document.getElementById('youtubeUrl').value;

            // Disable other options based on selection
            if (type === 'audio') {
                disableVideoOptions();
                showLoader('audioLoader');
            } else {
                disableAudioOption();
                disableOtherVideoOption(quality);
                showLoader(quality === '0' ? 'videoLoaderLow' : 'videoLoaderHigh');
            }

            try {
                await initiateDownload(url, type, quality);
            } catch (error) {
                alert('An error occurred during download. Please try again.');
                resetOptionsState();
            }
        });
    });

    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    }

    function showLoader(loaderId) {
        document.getElementById(loaderId).classList.add('active');
    }

    function hideLoader(loaderId) {
        document.getElementById(loaderId).classList.remove('active');
    }

    function disableVideoOptions() {
        videoOptionLow.classList.add('disabled');
        videoOptionHigh.classList.add('disabled');
    }

    function disableAudioOption() {
        audioOption.classList.add('disabled');
    }

    function disableOtherVideoOption(selectedQuality) {
        if (selectedQuality === '0') {
            videoOptionHigh.classList.add('disabled');
        } else {
            videoOptionLow.classList.add('disabled');
        }
    }

    function resetOptionsState() {
        audioOption.classList.remove('disabled');
        videoOptionLow.classList.remove('disabled');
        videoOptionHigh.classList.remove('disabled');
        document.querySelectorAll('.loader').forEach(loader => {
            loader.classList.remove('active');
        });
    }

    async function initiateDownload(youtubeURL, type, quality) {
        const baseUrl = 'http://localhost:3000/AudioVideo';
        const apiUrl = type === 'audio' ? `${baseUrl}/downloadAudio` : `${baseUrl}/downloadVideo`;
        
        // For URL encoded form data
        const formData = new URLSearchParams();
        formData.append('youtubeURL', youtubeURL);
        if (quality !== undefined) {
            formData.append('quality', quality);
        }
        // Demo
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `youtube-${type}-${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            // Reset the interface after successful download
            setTimeout(resetOptionsState, 1000);

        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    }
});