USE FIGURES;

-- Insert shadows (with explicit IDs - 0-indexed)
INSERT INTO OMBRA (id, nom, meshID, imgID) VALUES
(0, 'blank', '', ''),
(1, 'Cercle', '#foratCercle', '#shadowCircle'),
(2, 'Quadrat', '#foratQuadrat', '#shadowSquare'),
(3, 'Equilàter', '#foratEquilater', '#shadowTriangle'),
(4, '#T', '#T', '#shadowT'), -- TODO: foratT
(5, '#V', '#V', '#shadowV'); -- TODO: foratV

-- Insert CLASSE records (0-indexed)
INSERT INTO CLASSE (id, nom, descripcio) VALUES
(0, 'Debug class', 'Class with all figures available'),
(1, 'Figures bàsiques', 'Cube, sphere and tetrahedron'),
(2, 'Figures primitives', 'Cylinder, pyramid and prism'),
(3, 'Triform', 'The tap figure'),
(4, 'Plus, T i V', 'Plus, T and V figures');

-- Insert FIGURA records (0-indexed) -- Amarillo, verde, rojo :D
INSERT INTO FIGURA (id, meshID, nom, descript, alzada, planta, perfil, idClasse) VALUES
-- Class 0: Debug class - all figures
(0, '#tap', 'Triform', 'Combinació de les tres formes geomètriques', 3, 1, 2, 0),
(1, '#cube', 'Cube', 'Forma bàsica cúbica', 2, 2, 2, 0),
(2, '#sphere', 'Sphere', 'Forma bàsica esfèrica', 1, 1, 1, 0),
(3, '#tetra', 'Tetrahedron', 'Forma bàsica tetraèdrica', 3, 3, 3, 0),
(4, '#piramid', 'Pyramid', 'Forma piramidal', 3, 2, 3, 0),
(5, '#cone', 'Cone', 'Forma cònica', 3, 1, 3, 0),
(6, '#prism', 'Prism', 'Forma prismàtica', 2, 2, 2, 0),
(7, '#cylinder', 'Cylinder', 'Forma cilíndrica', 2, 1, 1, 0),
(8, '#plus', 'Plus', 'Figura amb forma de plus', 2, 2, 2, 0),
(9, '#L', 'L', 'Figura amb forma de L', -1, 2, 2, 0), -- TODO: si se implementa, crear su sombra
(10, '#T', 'T', 'Figura amb forma de T', 4, 2, 2, 0),
(11, '#V', 'V', 'Figura amb forma de V', 5, 2, 2, 0);

-- Insert relations in R_CLASSE_FIGURA
-- Class 0: All figures
INSERT INTO R_CLASSE_FIGURA (idClasse, idFigura) VALUES
(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7), (0, 8), (0, 9), (0, 10), (0, 11),

-- Class 1: cube, sphere, tetrahedron
(1, 1), (1, 2), (1, 3),

-- Class 2: cylinder, pyramid, prism
(2, 6), (2, 4), (2, 7),

-- Class 3: tap (triform)
(3, 0),

-- Class 4: Plus, T and V
(4, 8), (4, 10), (4, 11);
