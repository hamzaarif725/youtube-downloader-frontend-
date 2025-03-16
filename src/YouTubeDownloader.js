import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://angelic-perception-production.up.railway.app";  // Change this to your Railway backend URL

const YouTubeDownloader = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");  
  const [error, setError] = useState("");

  // Function to fetch video details
  const fetchVideoInfo = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    setVideoInfo(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/get_video_info`,
        { url: url },
        { headers: { "Content-Type": "application/json" } }
      );
      setVideoInfo(response.data);
    } catch (error) {
      setError("Failed to fetch video. Make sure the URL is correct.");
      console.error("Error fetching video:", error);
    }
    setLoading(false);
  };

  // Function to handle video download
  const downloadVideo = async () => {
    if (!videoInfo || !videoInfo.video_id) {
      setError("No video ID available for download.");
      return;
    }

    setDownloading(true);
    setMessage("");
    try {
      console.log("Sending Video ID:", videoInfo.video_id);

      const response = await axios.post(
        `${API_BASE_URL}/download`,
        { video_id: videoInfo.video_id },
        { responseType: "blob" }
      );

      // ✅ Check if the video is already downloaded
      if (response.data.message === "Video is already downloaded") {
        setMessage("This video has already been downloaded!");
        setDownloading(false);
        return;
      }

      const blob = new Blob([response.data], { type: "video/mp4" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", `${videoInfo.title}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      setMessage("Download complete!");
    } catch (error) {
      setError("Error downloading video.");
      console.error("Error downloading video:", error);
    }
    setDownloading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>YouTube Video Downloader</h2>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: "10px", width: "60%" }}
      />
      <button
        onClick={fetchVideoInfo}
        disabled={loading}
        style={{ marginLeft: "10px", padding: "10px" }}
      >
        {loading ? "Loading..." : "Fetch Video Info"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}  {/* Show success messages */}

      {videoInfo && (
        <div style={{ marginTop: "20px" }}>
          <h3>{videoInfo.title}</h3>
          <img src={videoInfo.thumbnail} alt="Thumbnail" width="200" />
          <p>{videoInfo.description}</p>

          <button
            onClick={downloadVideo}
            disabled={downloading}
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: downloading ? "gray" : "green",
              color: "white",
            }}
          >
            {downloading ? "Downloading..." : "Download Video"}
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubeDownloader;
