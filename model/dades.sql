USE FIGURES;

-- Insert shadows
INSERT INTO OMBRA (meshID, imgID, nom) VALUES
('foratCercle', 'shadowCircle', 'Cercle'),
('foratQuadrat', 'shadowSquare', 'Quadrat'),
('foratEquilater', 'shadowTriangle', 'Equilàter');

-- Insert FIGURA triforma with references to the shadows
-- Assuming the shadows get IDs 1, 2, 3 in order of insertion
INSERT INTO FIGURA (meshID, nom, descript, alzada, planta, perfil) VALUES
('triforma', 'Triforma', 'Combinació de les tres formes geomètriques', 1, 3, 2);