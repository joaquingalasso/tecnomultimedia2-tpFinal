import gab.opencv.*;
import processing.core.*;
import processing.video.*;
import fisica.*;

PImage img;
OpenCV opencv;
FWorld mundo;
ArrayList<PVector> polygonPoints;
ArrayList<FCircle> circles;
FPoly poly;
FWorld world;

Capture camara;

int ancho = 640;
int alto = 480;
int umbral = 200;

void setup() {
  size(640, 480);

  // Inicializo el mundo físico
  Fisica.init(this);
  world = new FWorld();
  world.setGravity(0, 200);

  circles = new ArrayList<FCircle>();


  // Devuelve la lista de cámaras disponibles
  String[] listaDeCamaras = Capture.list();
  if (listaDeCamaras.length == 0) {
    println("No se encontraron cámaras.");
    exit(); // Salir si no hay cámaras disponibles
  } else {
    println("Cámaras disponibles:");
    printArray(listaDeCamaras); // Imprimir la lista de cámaras disponibles
    // Selecciona la primera cámara (puedes cambiar el índice si tienes más de una)
    camara = new Capture(this, listaDeCamaras[0]);
    camara.start();
  }

  // Inicializo OpenCV
  opencv = new OpenCV(this, ancho, alto);
  opencv.findContours();


  // Crear límites
  createBoundaries();
}
void draw() {

  if (camara.available()) {
    opencv.threshold(umbral);
    camara.read(); // Asegurarse de que la imagen se actualiza
  }
  PImage salida = opencv.getOutput();
  image(salida, 0, 0);

  // Actualizar el mundo físico
  world.step();
  world.draw();

  // Encontrar y dibujar el contorno más grande, y actualizar el objeto de físicas
  findAndSimplifyLargestPolygon();

  // Aquí puedes agregar tu lógica para mover un fcircle que colisione con el polígono
  // Por ejemplo, una pelotita que siga el mouse:
  if (circles.size() == 0) {
    FCircle ball = new FCircle(50);
    ball.setPosition(100, 100);
    ball.setRestitution(1);
    ball.setVelocity(-100, 0);
    world.add(ball);
    circles.add(ball);
  } else {
    FCircle ball = circles.get(0);
  }
}

void createBoundaries() {
  // Límites de la pantalla (rectángulos invisibles)
  FBox top = new FBox(width, 10);
  top.setPosition(width/2, 5);
  top.setStatic(true);
  world.add(top);

  FBox bottom = new FBox(width, 10);
  bottom.setPosition(width/2, height - 5);
  bottom.setStatic(true);
  world.add(bottom);

  FBox left = new FBox(10, height);
  left.setPosition(5, height/2);
  left.setStatic(true);
  world.add(left);

  FBox right = new FBox(10, height);
  right.setPosition(width - 5, height/2);
  right.setStatic(true);
  world.add(right);
}


void findAndSimplifyLargestPolygon() {

  if (poly != null) {
    world.remove(poly);
  }

  // Buscar contornos en la imagen

  opencv.loadImage(camara);
  opencv.invert();
  // Aplicar umbral para detectar blancos
  opencv.threshold(umbral);

  // // Buscar contornos
  opencv.findContours();
  ArrayList<Contour> contours = opencv.findContours();

  if (contours.size() > 0) {
    Contour largestContour = contours.get(0);

    // Encontrar el contorno más grande
    for (Contour contour : contours) {
      if (contour.area() > largestContour.area()) {
        largestContour = contour;
      }
    }

    // Simplificar el contorno
    largestContour = largestContour.getPolygonApproximation();


    // Dibujar el contorno simplificado
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    polygonPoints = new ArrayList<PVector>();
    for (int i = 0; i < largestContour.numPoints(); i++) {
      PVector point = largestContour.getPoints().get(i);
      vertex(point.x, point.y);
      polygonPoints.add(point);
    }
    endShape(CLOSE);

    // Crear un nuevo objeto de físicas
    poly = new FPoly();
    for (PVector point : polygonPoints) {
      poly.vertex(point.x, point.y);
    }
    poly.setStatic(true);
    poly.setFill(0,255,0,50);
    world.add(poly);
  }
}
