// Funções específicas para clientes
function loadAllMusics() {
  musicRef.on("value", function (snapshot) {
    const musicList = $("#client-music-list-container");
    musicList.empty();
    currentMusicList = [];

    snapshot.forEach(function (childSnapshot) {
      const key = childSnapshot.key;
      const data = childSnapshot.val();

      let totalRatings = 0;
      let ratingCount = 0;
      let userRating = 0;

      if (data.ratings) {
        for (const userId in data.ratings) {
          totalRatings += data.ratings[userId];
          ratingCount++;
          if (userId === loggedInUser.uid) {
            userRating = data.ratings[userId];
          }
        }
      }
      const avgRating =
        ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : "N/A";

      currentMusicList.push({
        key,
        ...data,
        avgRating,
        ratingCount,
        userRating,
      });

      const hasUserRated = userRating > 0;
      const ratingButtonText = hasUserRated ? "Alterar Avaliação" : "Avaliar";

      const itemHtml = `
              <li class="bg-[#1e1e1e] p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 transition-all duration-200 hover:bg-[#282828] cursor-pointer">
                  <img src="${
                    data.photoUrl ||
                    "https://placehold.co/100x100/3e3e3e/b3b3b3?text=N/A"
                  }" alt="Capa do Álbum" class="w-32 h-32 rounded-lg object-cover">
                  <div class="flex-1 text-center sm:text-left">
                      <div class="font-bold text-xl">${data.title}</div>
                      <div class="text-[#b3b3b3] text-sm">${
                        data.artist_name
                      } | ${data.album} (${data.year})</div>
                      <div class="text-[#b3b3b3] text-sm mt-1">Gênero: ${
                        data.genre ? data.genre.join(", ") : "N/A"
                      }</div>
                      <div class="flex items-center justify-center sm:justify-start mt-2">
                          <span class="text-sm font-semibold mr-2">Avaliação:</span>
                          <div class="rating-stars">
                              ${[1, 2, 3, 4, 5]
                                .map(
                                  (i) =>
                                    `<span class="star ${
                                      i <= Math.round(avgRating) ? "filled" : ""
                                    }">★</span>`
                                )
                                .join("")}
                          </div>
                          <span class="star-rating-label">(${avgRating} - ${ratingCount} votos)</span>
                      </div>
                      ${
                        hasUserRated
                          ? `
                      <div class="flex items-center justify-center sm:justify-start mt-2">
                          <span class="text-sm font-semibold mr-2">Sua avaliação:</span>
                          <div class="rating-stars">
                              ${[1, 2, 3, 4, 5]
                                .map(
                                  (i) =>
                                    `<span class="star ${
                                      i <= userRating ? "filled" : ""
                                    }">★</span>`
                                )
                                .join("")}
                          </div>
                      </div>`
                          : ""
                      }
                  </div>
                  <div class="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
                      <button class="btn btn-secondary px-4 py-2 rounded-full rate-btn" data-key="${key}">${ratingButtonText}</button>
                  </div>
              </li>
          `;
      musicList.append(itemHtml);
    });
  });
}

function loadUserRatings() {
  musicRef.on("value", function (snapshot) {
    const musicList = $("#client-rated-musics-container");
    musicList.empty();
    currentRatingsList = [];

    snapshot.forEach(function (childSnapshot) {
      const key = childSnapshot.key;
      const data = childSnapshot.val();

      if (data.ratings && data.ratings[loggedInUser.uid]) {
        const userRating = data.ratings[loggedInUser.uid];
        currentRatingsList.push({ key, ...data, userRating });

        const itemHtml = `
                  <li class="bg-[#1e1e1e] p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 transition-all duration-200 hover:bg-[#282828] cursor-pointer">
                      <img src="${
                        data.photoUrl ||
                        "https://placehold.co/100x100/3e3e3e/b3b3b3?text=N/A"
                      }" alt="Capa do Álbum" class="w-32 h-32 rounded-lg object-cover">
                      <div class="flex-1 text-center sm:text-left">
                          <div class="font-bold text-xl">${data.title}</div>
                          <div class="text-[#b3b3b3] text-sm">${
                            data.artist_name
                          } | ${data.album} (${data.year})</div>
                          <div class="flex items-center justify-center sm:justify-start mt-2">
                              <span class="text-sm font-semibold mr-2">Sua Avaliação:</span>
                              <div class="rating-stars">
                                  ${[1, 2, 3, 4, 5]
                                    .map(
                                      (i) =>
                                        `<span class="star ${
                                          i <= userRating ? "filled" : ""
                                        }">★</span>`
                                    )
                                    .join("")}
                              </div>
                          </div>
                      </div>
                      <div class="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
                          <button class="btn btn-secondary px-4 py-2 rounded-full rate-btn" data-key="${key}">Alterar Avaliação</button>
                      </div>
                  </li>
              `;
        musicList.append(itemHtml);
      }
    });

    if (currentRatingsList.length === 0) {
      musicList.append(
        '<li class="text-center text-[#b3b3b3] p-4">Você ainda não avaliou nenhuma música.</li>'
      );
    }
  });
}
