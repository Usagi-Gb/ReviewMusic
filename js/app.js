// Inicialização da aplicação
$(document).ready(function () {
  populateGenreSelects();

  // Lógica de avaliação
  let currentMusicKeyForRating = null;
  let currentRating = 0;

  $(document).on("click", ".rate-btn", function () {
    currentMusicKeyForRating = $(this).data("key");
    const music =
      currentMusicList.find((m) => m.key === currentMusicKeyForRating) ||
      currentRatingsList.find((m) => m.key === currentMusicKeyForRating);

    $("#rating-modal-title").text(
      `Avaliar: ${music.title} - ${music.artist_name}`
    );
    $("#star-rating-container .star").removeClass("filled");
    $("#rating-value-label").text("0");
    currentRating = 0;

    if (music.ratings && music.ratings[loggedInUser.uid]) {
      currentRating = music.ratings[loggedInUser.uid];
      $(`#star-rating-container .star[data-rating=${currentRating}]`)
        .prevAll()
        .addBack()
        .addClass("filled");
      $("#rating-value-label").text(currentRating);
    }

    $("#rating-modal").show();
  });

  $(document)
    .on("mouseover", "#star-rating-container .star", function () {
      const rating = $(this).data("rating");
      $(this).prevAll().addBack().addClass("filled");
      $(this).nextAll().removeClass("filled");
    })
    .on("mouseout", "#star-rating-container", function () {
      $(this).children(".star").removeClass("filled");
      $(`#star-rating-container .star[data-rating=${currentRating}]`)
        .prevAll()
        .addBack()
        .addClass("filled");
    })
    .on("click", "#star-rating-container .star", function () {
      currentRating = $(this).data("rating");
      $("#rating-value-label").text(currentRating);
    });

  $("#submit-rating-btn").on("click", function () {
    if (currentRating > 0) {
      const ratingData = {};
      ratingData[loggedInUser.uid] = currentRating;

      musicRef
        .child(currentMusicKeyForRating)
        .child("ratings")
        .update(ratingData)
        .then(() => {
          $("#rating-modal").hide();
          showMessage(
            "main-page-message",
            "Avaliação enviada com sucesso!",
            "success"
          );
          loadUserRatings();
        })
        .catch((error) => {
          console.error("Erro ao enviar avaliação:", error);
          showMessage(
            "rating-message",
            "Erro ao enviar avaliação. Tente novamente.",
            "error"
          );
        });
    } else {
      showMessage(
        "rating-message",
        "Por favor, selecione uma avaliação.",
        "error"
      );
    }
  });
});
