// Comisión de Lisandro y Abril - Baccalaro; Esteban; Farías Jomnuk; Galasso; Custodio; Ardaiz.
// Video explicativo: 

let monitorear = true;

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

const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

function preload() {

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

  antesHabiaSonido = false;

}

function draw() {
  let vol = mic.getLevel(); // cargo en vol la amplitud del micrófono (señal cruda);
  gestorAmp.actualizar(vol);

  haySonido = gestorAmp.filtrada > AMP_MIN; // umbral de ruido que define el estado haySonido

  let inicioElSonido = haySonido && !antesHabiaSonido; // evendo de INICIO de un sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // evento de fIN de un sonido

  if (estado == "inicio") {
    background(0);

    if (inicioElSonido) {
    }

    if (haySonido) {
      //Estado
      
    }

    if (finDelSonido) {
      //Evento
     
    }
    if (!haySonido) {
      //Estado SILENCIO
      
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
    //console.log(frequency);

    getPitch();
  });
}
