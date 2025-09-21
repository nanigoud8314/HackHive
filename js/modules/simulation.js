
export class SimulationModule {
  render() {
    return `
      <div class="simulation-container">
        <h2 class="page-title">Simulation Videos</h2>
        <div class="video-gallery">
          ${this.renderVideoList()}
        </div>
      </div>
    `;
  }

  renderVideoList() {
    const videos = [
      { id: 1, title: 'Earthquake Safety Drill', thumbnail: 'images/earthquake_thumb.jpg', url: 'videos/earthquake_sim.mp4' },
      { id: 2, title: 'Fire Evacuation Procedure', thumbnail: 'images/fire_thumb.jpg', url: 'videos/fire_sim.mp4' },
      { id: 3, title: 'Flood Preparedness', thumbnail: 'images/flood_thumb.jpg', url: 'videos/flood_sim.mp4' },
      { id: 4, title: 'Cyclone Shelter Simulation', thumbnail: 'images/cyclone_thumb.jpg', url: 'videos/cyclone_sim.mp4' },
    ];

    return videos.map(video => `
      <div class="video-card" data-url="${video.url}">
        <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
        <div class="video-info">
          <h4 class="video-title">${video.title}</h4>
          <button class="btn btn-secondary play-video-btn">Play</button>
        </div>
      </div>
    `).join('');
  }

  initialize() {
    document.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const videoUrl = e.currentTarget.dataset.url;
        this.playVideo(videoUrl);
      });
    });
  }

  playVideo(videoUrl) {
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-player-overlay');
    videoContainer.innerHTML = `
      <div class="video-player-modal">
        <video src="${videoUrl}" controls autoplay></video>
        <button class="close-video-player">×</button>
      </div>
    `;
    document.body.appendChild(videoContainer);

    videoContainer.querySelector('.close-video-player').addEventListener('click', () => {
      videoContainer.remove();
    });
  }
}
