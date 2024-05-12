function wordCountToReadingTime(wordCount) {
    // Assuming average reading speed is 200 words per minute
    const averageReadingSpeed = 200;
    // Calculate reading time in minutes
    const readingTime = Math.ceil(wordCount / averageReadingSpeed);
    return readingTime;
}

// Export the function for use in other files
module.exports = {
    wordCountToReadingTime
};