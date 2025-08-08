// Funções para manipulação de modais
function navigateTo(pageId) {
  $(".page").removeClass("active");
  $(`#${pageId}`).addClass("active");
}

function navigateToSection(sectionId) {
  $(".page-section").removeClass("active");
  $(`#${sectionId}`).addClass("active");
  $(".nav-link").removeClass("active");
  $(`.nav-link[data-page="${sectionId}"]`).addClass("active");
}

let confirmCallback = null;

function showConfirmModal(message, callback) {
  $("#confirm-message").text(message);
  $("#confirm-modal").show();
  confirmCallback = callback;
}

// Eventos de modais
$(document).on("click", ".nav-link[data-page]", function () {
  const sectionId = $(this).data("page");
  navigateToSection(sectionId);
});

$(".modal-close-btn").on("click", function () {
  $(".modal").hide();
});

$(window).on("click", function (e) {
  if ($(e.target).is(".modal")) {
    $(".modal").hide();
  }
});

$("#confirm-ok-btn").on("click", function () {
  if (confirmCallback) {
    confirmCallback();
  }
  $("#confirm-modal").hide();
});

$("#confirm-cancel-btn").on("click", function () {
  $("#confirm-modal").hide();
});

// Abre modal de registro
$("#show-register-modal-btn").on("click", function () {
  $("#register-modal").show();
});

// Popula os campos de gênero
function populateGenreSelects() {
  const genreOptions = predefinedGenres
    .map((genre) => `<option value="${genre}">${genre}</option>`)
    .join("");
  $("#music-genre").html(genreOptions);
  $("#edit-genre").html(genreOptions);
}
