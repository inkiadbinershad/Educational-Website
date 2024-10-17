// Handle video uploads
document.getElementById('videoUploadForm').onsubmit = function(e) {
    e.preventDefault(); // Prevent form submission
    const videoUrl = document.getElementById('videoUrl').value;

    // Validate the YouTube URL
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        // Create a video container
        const videoContainer = document.createElement('div');
        videoContainer.innerHTML = `
            <h3>Uploaded Video:</h3>
            <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            <p>${videoUrl}</p>
        `;
        document.getElementById('videoList').appendChild(videoContainer);
        document.getElementById('videoUrl').value = ''; // Clear the input field
    } else {
        alert('Invalid YouTube URL. Please enter a valid link.');
    }
};

// Allow adding multiple videos with the "+" button
document.getElementById('addMoreVideoBtn').onclick = function() {
    document.getElementById('videoUrl').value = ''; // Clear the input field for a new URL
    document.getElementById('videoUrl').focus(); // Set focus on the input field
};
