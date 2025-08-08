// Funções de autenticação
function showMessage(elementId, message, type = "error") {
  const msgElement = $(`#${elementId}`);
  msgElement
    .text(message)
    .removeClass("text-green-500 text-blue-500 text-red-500")
    .addClass(
      `text-${
        type === "success" ? "green" : type === "info" ? "blue" : "red"
      }-500`
    )
    .fadeIn();
  if (type !== "error") {
    msgElement.delay(3000).fadeOut();
  }
}

// Monitora o estado de autenticação
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    usersRef.child(user.uid).once("value", function (snapshot) {
      const userData = snapshot.val();
      loggedInUser = {
        name: userData.name,
        email: user.email,
        uid: user.uid,
        type: userData.type,
      };

      if (userData.type === "artista") {
        $("#artist-welcome-message").text(`Olá, ${userData.name} (Artista)`);
        navigateTo("artist-page");
        loadArtistMusics();
      } else {
        $("#client-welcome-message").text(`Olá, ${userData.name} (Cliente)`);
        navigateTo("client-page");
        loadAllMusics();
        loadUserRatings();
      }
      $("#login-page").hide();
    });
  } else {
    loggedInUser = null;
    $(".page").removeClass("active");
    $("#login-page").addClass("active");
  }
});

// Login
$("#login-btn").on("click", async function () {
  const email = $("#login-email").val();
  const password = $("#login-password").val();

  if (!email || !password) {
    showMessage("login-message", "Por favor, preencha todos os campos.");
    return;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    let errorMessage = "Ocorreu um erro. Tente novamente.";
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "E-mail ou senha inválidos.";
        break;
      case "auth/invalid-email":
        errorMessage = "E-mail inválido.";
        break;
      case "auth/too-many-requests":
        errorMessage =
          "Muitas tentativas de login. Tente novamente mais tarde.";
        break;
    }
    showMessage("login-message", errorMessage);
  }
});

// Logout
$("#client-logout-btn, #artist-logout-btn").on("click", function () {
  firebase.auth().signOut();
});

// Registro
$("#register-form").on("submit", async function (e) {
  e.preventDefault();
  const newName = $("#register-name").val();
  const newEmail = $("#register-email").val();
  const newPassword = $("#register-password").val();
  const userType = $("#user-type").val();

  if (!newName || !newEmail || !newPassword) {
    showMessage("register-message", "Por favor, preencha todos os campos.");
    return;
  }

  try {
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(newEmail, newPassword);
    const user = userCredential.user;

    await usersRef.child(user.uid).set({
      name: newName,
      email: newEmail,
      type: userType,
    });

    showMessage(
      "register-message",
      "Cadastro realizado com sucesso!",
      "success"
    );
    $("#register-form")[0].reset();

    setTimeout(function () {
      $("#register-modal").hide();
    }, 2000);
  } catch (error) {
    let errorMessage = "Ocorreu um erro. Tente novamente.";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Este e-mail já está em uso.";
        break;
      case "auth/weak-password":
        errorMessage = "A senha deve ter no mínimo 6 caracteres.";
        break;
      case "auth/invalid-email":
        errorMessage = "E-mail inválido.";
        break;
    }
    showMessage("register-message", errorMessage);
  }
});
