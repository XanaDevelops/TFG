USE FIGURES;

-- Insert shadows (with explicit IDs - 0-indexed)
INSERT INTO OMBRA (id, meshID, imgID, nom) VALUES
(0, '', '', 'blank'),
(1, '#foratCercle', '#shadowCircle', 'Cercle'),
(2, '#foratQuadrat', '#shadowSquare', 'Quadrat'),
(3, '#foratEquilater', '#shadowTriangle', 'Equilàter');

-- Insert CLASSE records (0-indexed)
INSERT INTO CLASSE (id, nom, descripcio) VALUES
(0, 'Formes Bàsiques', 'Classes per a les formes geomètriques bàsiques'),
(1, 'Figures Triformes', 'Classes per a figures combinades');

-- Insert FIGURA triforma with references to the shadows
INSERT INTO FIGURA (id, meshID, nom, descript, alzada, planta, perfil, idClasse) VALUES
(0, '#tap', 'Triforma', 'Combinació de les tres formes geomètriques', 1, 3, 2, 1);

-- Insert relations in R_CLASSE_FIGURA
INSERT INTO R_CLASSE_FIGURA (idClasse, idFigura) VALUES
(1, 0);
