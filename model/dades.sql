USE FIGURES;

-- Insert shadows (with explicit IDs - 0-indexed)
INSERT INTO OMBRA (id, nom, meshID, imgID) VALUES
(0, 'blank', '', ''),
(1, 'Cercle', '#foratCercle', '#shadowCircle'),
(2, 'Quadrat', '#foratQuadrat', '#shadowSquare'),
(3, 'Equilàter', '#foratEquilater', '#shadowTriangle');

-- Insert CLASSE records (0-indexed)
INSERT INTO CLASSE (id, nom, descripcio) VALUES
(0, 'Debug class', 'Class with all figures available'),
(1, 'Figures bàsiques', 'Cube, sphere and tetrahedron'),
(2, 'Figures primitives', 'Cylinder, pyramid and prism'),
(3, 'Triform', 'The tap figure'),
(4, 'L i Plus', 'L and plus figures');

-- Insert FIGURA records (0-indexed)
INSERT INTO FIGURA (id, meshID, nom, descript, alzada, planta, perfil, idClasse) VALUES
-- Class 0: Debug class - all figures
(0, '#tap', 'Triform', 'Combinació de les tres formes geomètriques', 1, 3, 2, 0),
(1, '#cube', 'Cube', 'Forma bàsica cúbica', 2, 2, 2, 0),
(2, '#sphere', 'Sphere', 'Forma bàsica esfèrica', 1, 1, 1, 0),
(3, '#tetra', 'Tetrahedron', 'Forma bàsica tetraèdrica', 2, 3, 3, 0),
(4, '#piramid', 'Pyramid', 'Forma piramidal', 3, 2, 2, 0),
(5, '#cone', 'Cone', 'Forma cònica', 2, 1, 1, 0),
(6, '#prism', 'Prism', 'Forma prismàtica', 2, 2, 2, 0),
(7, '#cylinder', 'Cylinder', 'Forma cilíndrica', 2, 1, 1, 0),
(8, '#plus', 'Plus', 'Figura amb forma de plus', 2, 2, 2, 0),
(9, '#L', 'L', 'Figura amb forma de L', 2, 2, 2, 0);

-- Insert relations in R_CLASSE_FIGURA
-- Class 0: All figures
INSERT INTO R_CLASSE_FIGURA (idClasse, idFigura) VALUES
(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7), (0, 8), (0, 9),

-- Class 1: cube, sphere, tetrahedron
(1, 1), (1, 2), (1, 3),

-- Class 2: cylinder, pyramid, prism
(2, 6), (2, 4), (2, 7),

-- Class 3: tap (triform)
(3, 0),

-- Class 4: L and plus
(4, 8), (4, 9);
