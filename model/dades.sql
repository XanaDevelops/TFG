USE FIGURES;

-- Insert shadows (with explicit IDs - 0-indexed)
INSERT INTO OMBRA (id, meshID, imgID, nom) VALUES
(0, 'foratCercle', 'shadowCircle', 'Cercle'),
(1, 'foratQuadrat', 'shadowSquare', 'Quadrat'),
(2, 'foratEquilater', 'shadowTriangle', 'Equilàter');

-- Insert CLASSE records (0-indexed)
INSERT INTO CLASSE (id, nom, descripcio) VALUES
(0, 'Formes Bàsiques', 'Classes per a les formes geomètriques bàsiques'),
(1, 'Figures Triformes', 'Classes per a figures combinades HOLA');

-- Insert FIGURA triforma with references to the shadows
INSERT INTO FIGURA (id, meshID, nom, descript, alzada, planta, perfil, idClasse) VALUES
(0, 'triforma', 'Triforma', 'Combinació de les tres formes geomètriques', 0, 2, 1, 1);

-- Insert relations in R_CLASSE_FIGURA
INSERT INTO R_CLASSE_FIGURA (idClasse, idFigura) VALUES
(1, 0);
