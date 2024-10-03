// Comisión de Matías - Joray (77302/9); Esteban (93509/6); Galasso (94698/3); Farías Jomñuk (86909/7).
// Video explicativo: https://youtu.be/YxsqxWqlNRM

let monitorear = false;

let AMP_MIN = 0.02;
let AMP_MAX = 0.06;

let FREC_MIN = 20;
let FREC_MAX = 550;

let mic;
let pitch;
let audioContext;

let gestorAmp;
let gestorPitch;

let haySonido; // estado de cómo está el sonido en cada momento
let antesHabiaSonido; // memoria del estado anterior del sonido

let estado = "inicio";
let columnas = [];

let cantidadFilas;
let cantidadColumnas;
let cantidadCeldas;

let colorPaleta;
let colorRandom;

let colorRotulo;
let numRotulo;

let imagenesPaleta = [];

let textura;

let marca;

let filas = [];
let numFilas;

let margenX = 0;

const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

function preload() {
  loadFont('data/Kurt-Regular.otf');

  let urls_img = [
    "paleta/paleta_1.png",
    "paleta/paleta_2.png",
    "paleta/paleta_3.png",
    "paleta/paleta_4.png",
  ];

  textura = loadImage("data/textura.png");

  // Carga de las imágenes de trazos figura en el array imagen_paleta_fondo
  for (let i = 0; i < urls_img.length; i++) {
    loadImage(urls_img[i], (img) => {
      imagenesPaleta.push(img); // inicio la imagen cargada al array
    });
  }
}

function setup() {
  createCanvas(displayWidth, displayHeight);

  background(0);

  audioContext = getAudioContext(); // inicia el motor de audio
  mic = new p5.AudioIn(); // inicia el micrófono
  mic.start(startPitch); // se enciende el micrófono y le transmito el analisis de frecuencia (pitch) al micrófono. Conecto la libreria con el micrófono

  userStartAudio(); // por la dudas para forzar inicio de audio en algunos navegadores

  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial(FREC_MIN, FREC_MAX);

  colorMode(HSB, 360, 100, 100, 1);
  colorPaleta = new paleta(imagenesPaleta);

  colorRotulo = colorPaleta.darUnColor();
  numRotulo = int(random(1,1000000));

  antesHabiaSonido = false;

  // Crear las filas
  numFilas = 10;
  let y = 5;
  for (let i = 0; i < numFilas; i++) {
    let altura = i % 2 === 0 ? floor(random(25, 75)) : floor(random(75, 125));
    let margenY = i % 2 === 0 ? 10 : 10;
    let fila = new Fila(y, altura);
    filas.push(fila);
    y += altura + margenY;
    //y += (i > 0 ? (i % 2 === 0) ? filas[i].altura / 2: filas[i].altura * 2 : filas[i].altura * 2) + margenY;
  }
}

function draw() {
  let vol = mic.getLevel(); // cargo en vol la amplitud del micrófono (señal cruda);
  gestorAmp.actualizar(vol);

  haySonido = gestorAmp.filtrada > AMP_MIN; // umbral de ruido que define el estado haySonido

  let inicioElSonido = haySonido && !antesHabiaSonido; // evendo de INICIO de un sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // evento de fIN de un sonido

  if (estado == "inicio") {
    // Dibujar las filas
    background(0);

    //rectMode(CENTER);
    for (let fila of filas) {
      push();
      fila.display();
      pop();
    }
    marco();
    rotulo(colorRotulo, numRotulo);
    image(textura, 0, 0, displayWidth, displayHeight);

    if (inicioElSonido) {
    }

    if (haySonido) {
      //Estado
      columnas[cantidadColumnas] = new Columna();
    }

    if (finDelSonido) {
      //Evento
      marca = millis();
    }
    if (!haySonido) {
      //Estado SILENCIO
      push();
      dibujarTextura();
      pop();
      let ahora = millis();
    }
  }

  if (monitorear) {
    gestorAmp.dibujar(25, 25);
    gestorPitch.dibujar(225, 25);
  }

  printData();
  antesHabiaSonido = haySonido;
}

function dibujarTextura() {
  let numFibers = 150;
  if (frameCount % 10 === 0) {
    for (let i = 0; i < numFibers; i++) {
      let x1 = random() * displayWidth;
      let y1 = random() * displayHeight;
      let theta = random() * 2 * Math.PI;
      let segmentLength = random() * 5 + 1;
      let x2 = cos(theta) * segmentLength + x1;
      let y2 = sin(theta) * segmentLength + y1;
      stroke(0, 10 - random() * 5, 20 - random() * 8, random() * 2 + 10);
      line(x1, y1, x2, y2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  filas = [];
  setup(); // Vuelve a crear las filas y columnas cuando se redimensiona la ventana
}

// ---- Debug ---
function printData() {
  //background(255);
  //console.log(estado);
  //console.log(gestorAmp.filtrada);
  //console.log(gestorPitch.filtrada);
}
function keyPressed() {
  if (key == "f") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

// ---- Pitch detection ---
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    gestorPitch.actualizar(frequency);
    //adjustRowHeights(gestorAmp.filtrada);
    //console.log(frequency);

    getPitch();
  });
}
