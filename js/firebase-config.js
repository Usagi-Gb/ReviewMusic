// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAltKr8vmh4VhyTJjS3ZqmT5-ciQcrA7o8",
  authDomain: "review-music-plus.firebaseapp.com",
  projectId: "review-music-plus",
  storageBucket: "review-music-plus.appspot.com",
  messagingSenderId: "532217368762",
  appId: "1:532217368762:web:9b10dc498c26cc3b53f283",
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referências do banco de dados
const database = firebase.database();
const musicRef = database.ref("musics");
const usersRef = database.ref("users");

// Variáveis globais
let loggedInUser = null;
let currentMusicList = [];
let currentRatingsList = [];
const predefinedGenres = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Hip Hop",
  "Eletrônica",
  "Clássica",
  "Sertanejo",
  "Reggae",
  "Funk",
  "Indie",
  "Country",
  "Metal",
  "R&B",
];
