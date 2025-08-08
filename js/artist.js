// Funções específicas para artistas
function loadArtistMusics() {
  musicRef.on("value", function (snapshot) {
    const musicList = $("#artist-music-list-container");
    musicList.empty();
    currentMusicList = [];

    snapshot.forEach(function (childSnapshot) {
      const key = childSnapshot.key;
      const data = childSnapshot.val();

      if (data.artist_email === loggedInUser.email) {
        let totalRatings = 0;
        let ratingCount = 0;
        if (data.ratings) {
          for (const userId in data.ratings) {
            totalRatings += data.ratings[userId];
            ratingCount++;
          }
        }
        const avgRating =
          ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : "N/A";

        currentMusicList.push({ key, ...data, avgRating, ratingCount });

        const itemHtml = `
                  <li class="bg-[#1e1e1e] p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 transition-all duration-200 hover:bg-[#282828] cursor-pointer">
                      <img src="${
                        data.photoUrl ||
                        "https://placehold.co/100x100/3e3e3e/b3b3b3?text=N/A"
                      }" alt="Capa do Álbum" class="w-32 h-32 rounded-lg object-cover">
                      <div class="flex-1 text-center sm:text-left">
                          <div class="font-bold text-xl">${data.title}</div>
                          <div class="text-[#b3b3b3] text-sm">${data.album} (${
          data.year
        })</div>
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
                                          i <= Math.round(avgRating)
                                            ? "filled"
                                            : ""
                                        }">★</span>`
                                    )
                                    .join("")}
                              </div>
                              <span class="star-rating-label">(${avgRating} - ${ratingCount} votos)</span>
                          </div>
                      </div>
                      <div class="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
                          <button class="btn btn-secondary px-4 py-2 rounded-full edit-btn" data-key="${key}">Editar</button>
                          <button class="btn btn-danger px-4 py-2 rounded-full delete-btn" data-key="${key}">Excluir</button>
                      </div>
                  </li>
              `;
        musicList.append(itemHtml);
      }
    });

    if (currentMusicList.length === 0) {
      musicList.append(
        '<li class="text-center text-[#b3b3b3] p-4">Você ainda não adicionou nenhuma música.</li>'
      );
    }
  });
}

// Formulário para adicionar música
$("#music-form").on("submit", async function (e) {
  e.preventDefault();

  const title = $("#music-title").val();
  const album = $("#music-album").val();
  const year = $("#music-year").val();
  const genres = $("#music-genre").val();
  const description = $("#music-description").val();
  const translation = $("#music-translation").val();
  const photoUrl = $("#music-photo-url").val();

  if (title && album && year && genres.length > 0 && description) {
    musicRef.push({
      title,
      artist_name: loggedInUser.name,
      artist_email: loggedInUser.email,
      album,
      year: parseInt(year),
      genre: genres,
      description,
      translation,
      photoUrl,
    });

    $("#music-form")[0].reset();
    showMessage(
      "main-page-message",
      "Música adicionada com sucesso!",
      "success"
    );
    navigateToSection("artist-music-list");
  } else {
    showMessage(
      "main-page-message",
      "Preencha todos os campos obrigatórios!",
      "error"
    );
  }
});

// Edição de música
$(document).on("click", ".edit-btn", function () {
  const key = $(this).data("key");
  musicRef.child(key).once("value", function (snapshot) {
    const data = snapshot.val();
    if (data.artist_email === loggedInUser.email) {
      $("#edit-key").val(key);
      $("#edit-title").val(data.title);
      $("#edit-album").val(data.album);
      $("#edit-year").val(data.year);
      $("#edit-description").val(data.description);
      $("#edit-translation").val(data.translation);
      $("#edit-photo-url").val(data.photoUrl);
      $("#edit-genre").val(data.genre);
      $("#edit-modal").show();
    }
  });
});

$("#edit-form").on("submit", function (e) {
  e.preventDefault();
  const key = $("#edit-key").val();
  const updatedData = {
    title: $("#edit-title").val(),
    album: $("#edit-album").val(),
    year: parseInt($("#edit-year").val()),
    genre: $("#edit-genre").val(),
    description: $("#edit-description").val(),
    translation: $("#edit-translation").val(),
    photoUrl: $("#edit-photo-url").val(),
  };

  musicRef.child(key).update(updatedData);
  $("#edit-modal").hide();
  showMessage("main-page-message", "Música atualizada com sucesso!", "success");
});

// Exclusão de música
$(document).on("click", ".delete-btn", function () {
  const key = $(this).data("key");
  musicRef.child(key).once("value", function (snapshot) {
    const data = snapshot.val();
    if (data.artist_email === loggedInUser.email) {
      showConfirmModal(
        "Tem certeza que deseja excluir esta música?",
        function () {
          musicRef.child(key).remove();
          showMessage(
            "main-page-message",
            "Música excluída com sucesso!",
            "success"
          );
        }
      );
    }
  });
});

// Geração de tradução
$("#generate-translation-btn").on("click", async function () {
  const title = $("#music-title").val();
  const album = $("#music-album").val();

  if (!title || !album) {
    showMessage(
      "main-page-message",
      "Preencha o título e o álbum para gerar a tradução!",
      "error"
    );
    return;
  }

  const prompt = `Traduza o título da música '${title}' e o álbum '${album}' para o inglês. Forneça apenas o texto traduzido, formatado como 'Título - Álbum'.`;

  $(this).text("Gerando...").prop("disabled", true);

  try {
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      const translation = result.candidates[0].content.parts[0].text.replace(
        /^['"\s]+|['"\s]+$/g,
        ""
      );
      $("#music-translation").val(translation);
      showMessage(
        "main-page-message",
        "Tradução gerada com sucesso!",
        "success"
      );
    } else {
      throw new Error("Resposta da API inválida");
    }
  } catch (error) {
    console.error("Erro ao gerar tradução:", error);
    showMessage(
      "main-page-message",
      "Erro ao gerar tradução. Tente novamente.",
      "error"
    );
  } finally {
    $(this).text("Gerar Tradução").prop("disabled", false);
  }
});
